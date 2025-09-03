
// controllers/authController.js

const { User, PendingUser } = require('../models/user');
const RefreshToken = require('../models/refreshtoken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError
} = require('../utils/errors');
const logger = require('../utils/logger');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// These functions handle manual email/password registration, login, token refreshing, and logout.

exports.register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
    if (existingUser) {
      throw new ConflictError('A user with this email or username already exists.');
    }
    const existingPending = await PendingUser.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
    if (existingPending) {
      await PendingUser.deleteOne({ _id: existingPending._id }); // Remove old pending signup for this email/username
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Hash password before storing in PendingUser
    const hashedPassword = await bcrypt.hash(password, 12);
    const pendingUser = new PendingUser({ name, username, email, password: hashedPassword, signupOtp: otp, signupOtpExpires: otpExpires });
    await pendingUser.save();

    // Send OTP email
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Signup OTP',
      text: `Your OTP for signup is: ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'OTP sent to your email. Please verify to complete registration.' });

  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const emailOrUsername = req.body.emailOrUsername || req.body.email || req.body.username;
    const { password } = req.body;
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() }
      ]
    });
    if (!user) {
      logger.warn(`Login failed: User not found for ${emailOrUsername}`);
      throw new AuthenticationError('Invalid credentials. If you recently reset your password, please check your email and try again.');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      logger.warn(`Login failed: Password mismatch for ${user.email || user.username}`);
      throw new AuthenticationError('Invalid credentials. If you recently reset your password, please check your email and try again.');
    }

    if (!user.isVerified) {
      throw new AuthorizationError('Account not verified. Please verify your email before logging in.');
    }

    if (!user.isActive) {
      throw new AuthorizationError('Your account has been deactivated.');
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
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      throw new AuthenticationError('Invalid or expired refresh token. Please log in again.');
    }

    if (storedToken.expiresAt && storedToken.expiresAt < new Date()) {
        await RefreshToken.deleteOne({ token: refreshToken });
        throw new AuthenticationError('Refresh token expired. Please log in again.');
    }

    const user = await User.findById(storedToken.userId);
    if (!user) {
        await RefreshToken.deleteOne({ token: refreshToken });
        throw new AuthenticationError('User not found for this refresh token. Please log in again.');
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
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    await RefreshToken.deleteOne({ token: refreshToken });
    res.status(200).json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const emailOrUsername = req.body.email || req.body.username;
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() }
      ]
    });
    if (!user) {
      throw new NotFoundError('No user found with this email or username.');
    }
    if (!user.isVerified) {
      throw new ValidationError('Account not verified. Please complete signup verification first.');
    }

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
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const pendingUser = await PendingUser.findOne({ email: email.toLowerCase() });
    if (!pendingUser) {
      throw new NotFoundError('No pending registration found for this email.');
    }
    if (pendingUser.signupOtp !== otp) {
      throw new ValidationError('Invalid OTP.');
    }
    if (pendingUser.signupOtpExpires < new Date()) {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      throw new ValidationError('OTP expired. Please register again.');
    }
    // Create real user
    const newUser = new User({
      name: pendingUser.name,
      username: pendingUser.username,
      email: pendingUser.email,
      password: pendingUser.password,
      isVerified: true
    });
    await newUser.save();
    await PendingUser.deleteOne({ _id: pendingUser._id });
    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new NotFoundError('No user found with this email.');
    }
    if (!user.isVerified) {
      throw new ValidationError('Account not verified. Please complete signup verification first.');
    }
    if (!user.resetOtp || !user.resetOtpExpires) {
      throw new ValidationError('OTP not requested.');
    }
    if (user.resetOtp !== otp) {
      throw new ValidationError('Invalid OTP.');
    }
    if (user.resetOtpExpires < Date.now()) {
      throw new ValidationError('OTP expired.');
    }
    user.password = newPassword;
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();
    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    next(err);
  }
};

exports.verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new NotFoundError('No user found with this email.');
    }
    if (!user.isVerified) {
      throw new ValidationError('Account not verified. Please complete signup verification first.');
    }
    if (!user.resetOtp || !user.resetOtpExpires) {
      throw new ValidationError('OTP not requested.');
    }
    if (user.resetOtp !== otp) {
      throw new ValidationError('Invalid OTP.');
    }
    if (user.resetOtpExpires < Date.now()) {
      throw new ValidationError('OTP expired.');
    }
    res.json({ message: 'OTP verified. You can now reset your password.' });
  } catch (err) {
    next(err);
  }
};
