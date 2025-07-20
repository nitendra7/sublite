const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Secret keys (in production, use env variables)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// In-memory store for refresh tokens.
// WARNING: This is for demonstration purposes only. In a production environment,
// this will be cleared on every server restart, logging out all users.
// A persistent store like Redis or a dedicated database collection should be used.
let refreshTokens = [];

exports.register = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    // Create user with only allowed fields to prevent privilege escalation
    const user = new User({
      name,
      email,
      password: hashed,
      userType // Assuming 'userType' is a valid and sanitized field from the request
    });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const accessToken = jwt.sign({ id: user._id, userType: user.userType, name: user.name }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    
    refreshTokens.push(refreshToken);

    // Send user info along with tokens to make frontend's job easier
    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, userType: user.userType }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ error: 'Refresh token not found, login again' });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    
    // Fetch the user from the DB to ensure they still exist and to get fresh data.
    const user = await User.findById(payload.id).select('name userType');
    if (!user) {
      refreshTokens = refreshTokens.filter(token => token !== refreshToken); // Clean up invalid token
      return res.status(403).json({ error: 'User for this token not found.' });
    }

    const accessToken = jwt.sign({ id: user._id, name: user.name, userType: user.userType }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};

exports.logout = (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter(token => token !== refreshToken);
  res.json({ message: 'Logged out successfully' });
}; 