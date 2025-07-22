const User = require('../models/user');
const RefreshToken = require('../models/refreshToken'); // NEW: For persistent sessions
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Ensure these are in your .env file
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_default_access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_default_refresh_secret';

/**
 * @desc    Register a new user
 */
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

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({ name, username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully. Please log in.' });

  } catch (err) {
    res.status(500).json({ message: 'Server error during registration.', error: err.message });
  }
};

/**
 * @desc    Login a user and return tokens
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated.' });
    }

    const payload = {
      id: user._id,
      username: user.username,
      isProvider: user.isProvider,
      isAdmin: user.isAdmin,
    };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    await RefreshToken.create({ token: refreshToken, userId: user._id });

    res.json({
      accessToken,
      refreshToken,
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
    res.status(500).json({ message: 'Server error during login.', error: err.message });
  }
};

/**
 * @desc    Generate a new access token
 */
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

    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
        return res.status(403).json({ message: 'User not found.' });
    }

    const newPayload = {
      id: user._id,
      username: user.username,
      isProvider: user.isProvider,
      isAdmin: user.isAdmin,
    };

    const newAccessToken = jwt.sign(newPayload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    res.json({ accessToken: newAccessToken });

  } catch (err) {
    await RefreshToken.deleteOne({ token: refreshToken });
    res.status(403).json({ message: 'Invalid or expired refresh token. Please log in again.' });
  }
};

/**
 * @desc    Logout a user
 */
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }
  res.status(200).json({ message: 'Logged out successfully.' });
};