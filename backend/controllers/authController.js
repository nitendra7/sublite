// controllers/authController.js

const User = require('../models/user');
const RefreshToken = require('../models/refreshtoken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// These functions handle manual email/password registration, login, token refreshing, and logout.

exports.register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Name, username, email, and password are required.' });
    }

    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email or username already exists.' });
    }

    // Save password as plain text; pre-save hook will hash it
    const newUser = new User({ name, username, email, password });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully. Please log in.' });

  } catch (err) {
    console.error('Server error during manual registration:', err);
    res.status(500).json({ message: 'Server error during registration.', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Email/Username and password are required.' });
    }
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() }
      ]
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated.' });
    }

    const newRefreshToken = uuidv4();
    const refreshTokenExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000);

    await RefreshToken.deleteOne({ userId: user._id });
    await RefreshToken.create({ token: newRefreshToken, userId: user._id, expiresAt: new Date(refreshTokenExpiry) });

    const accessTokenPayload = {
      userId: user._id,
      id: user._id, // Keep both for backward compatibility
      username: user.username,
      isProvider: user.isProvider,
      isAdmin: user.isAdmin,
      tokenType: 'custom_jwt'
    };
    const accessToken = jwt.sign(accessTokenPayload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        isProvider: user.isProvider,
        isAdmin: user.isAdmin,
      }
    });

  } catch (err) {
    console.error('Server error during manual login:', err);
    res.status(500).json({ message: 'Server error during login.', error: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required.' });
  }

  try {
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      return res.status(403).json({ message: 'Invalid or expired refresh token. Please log in again.' });
    }

    if (storedToken.expiresAt && storedToken.expiresAt < new Date()) {
        await RefreshToken.deleteOne({ token: refreshToken });
        return res.status(403).json({ message: 'Refresh token expired. Please log in again.' });
    }

    const user = await User.findById(storedToken.userId);
    if (!user) {
        await RefreshToken.deleteOne({ token: refreshToken });
        return res.status(403).json({ message: 'User not found for this refresh token. Please log in again.' });
    }

    await RefreshToken.deleteOne({ token: refreshToken });
    const newRefreshToken = uuidv4();
    const newRefreshTokenExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
        token: newRefreshToken,
        userId: user._id,
        expiresAt: new Date(newRefreshTokenExpiry)
    });

    const newAccessTokenPayload = {
      userId: user._id,
      id: user._id, // Keep both for backward compatibility
      username: user.username,
      isProvider: user.isProvider,
      isAdmin: user.isAdmin,
      tokenType: 'custom_jwt'
    };
    const newAccessToken = jwt.sign(newAccessTokenPayload, ACCESS_TOKEN_SECRET, { expiresIn: '8h' });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });

  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(403).json({ message: 'Invalid refresh token. Please log in again.', error: err.message });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    try {
      await RefreshToken.deleteOne({ token: refreshToken });
      res.status(200).json({ message: 'Logged out successfully.' });
    } catch (err) {
      console.error('Error during logout:', err);
      res.status(500).json({ message: 'Server error during logout.', error: err.message });
    }
  } else {
    res.status(400).json({ message: 'Refresh token not provided for logout.' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'No user found with this email.' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Sublite Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`
    });

    res.json({ message: 'OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending OTP.', error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetOtp || !user.resetOtpExpires) return res.status(400).json({ message: 'OTP not requested.' });
    if (user.resetOtp !== otp) return res.status(400).json({ message: 'Invalid OTP.' });
    if (user.resetOtpExpires < Date.now()) return res.status(400).json({ message: 'OTP expired.' });
    res.json({ message: 'OTP verified.' });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying OTP.', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetOtp || !user.resetOtpExpires) return res.status(400).json({ message: 'OTP not requested.' });
    if (user.resetOtp !== otp) return res.status(400).json({ message: 'Invalid OTP.' });
    if (user.resetOtpExpires < Date.now()) return res.status(400).json({ message: 'OTP expired.' });
    user.password = await bcrypt.hash(newPassword, 12);
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();
    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password.', error: err.message });
  }
};