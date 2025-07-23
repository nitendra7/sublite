// controllers/authController.js

const User = require('../models/user');
const RefreshToken = require('../models/refreshtoken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library'); // For Google Login
const { v4: uuidv4 } = require('uuid'); // For generating unique refresh tokens

// Ensure these are in your .env file
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET; // Used for signing refresh tokens if they are JWTs
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // Your Google Client ID

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID); // Renamed to avoid conflict with 'client' in other contexts

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
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
    console.error('Server error during registration:', err);
    res.status(500).json({ message: 'Server error during registration.', error: err.message });
  }
};

/**
 * @desc    Login a user and return tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isActive) { // Assuming an 'isActive' field in your User model
      return res.status(403).json({ message: 'Your account has been deactivated.' });
    }

    // Generate new refresh token
    const newRefreshToken = uuidv4(); // Generate a unique UUID for the refresh token
    const refreshTokenExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days expiry

    // Save refresh token to the RefreshToken model (for persistent sessions)
    // Assuming RefreshToken model has 'token' and 'userId' fields
    await RefreshToken.create({ token: newRefreshToken, userId: user._id });

    // Generate access token
    const accessTokenPayload = {
      id: user._id,
      username: user.username,
      isProvider: user.isProvider,
      isAdmin: user.isAdmin,
    };
    const accessToken = jwt.sign(accessTokenPayload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

    res.json({
      accessToken,
      refreshToken: newRefreshToken, // Send the UUID-based refresh token
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
    console.error('Server error during login:', err);
    res.status(500).json({ message: 'Server error during login.', error: err.message });
  }
};

/**
 * @desc    Handle Google Login/Signup
 * @route   POST /api/auth/google-login
 * @access  Public
 */
exports.googleLogin = async (req, res) => {
  const { token } = req.body; // The Google ID token sent from the frontend

  if (!token) {
    return res.status(400).json({ error: 'Google ID token is missing.' });
  }

  try {
    // 1. Verify the Google ID token with Google's servers
    const ticket = await googleClient.verifyIdToken({ // Use googleClient
      idToken: token,
      audience: GOOGLE_CLIENT_ID, // Ensure the token is for your app
    });

    // 2. Extract payload (user information) from the verified token
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Google token does not contain an email address.' });
    }

    // 3. Find or create a user in your database
    let user = await User.findOne({ email });

    if (!user) {
      // If user doesn't exist, create a new one
      const generatedPassword = Math.random().toString(36).slice(-8); // Generate a random string
      const hashedPassword = await bcrypt.hash(generatedPassword, 10); // Hash it

      user = new User({ // Create a new Mongoose document
        name: name || 'Google User',
        email: email.toLowerCase(),
        username: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ''), // Simple username, sanitize
        password: hashedPassword, // Store the hashed generated password
        profilePicture: picture,
        isSocialLogin: true, // Mark as a social login user
        // Add any other default fields required by your User model
      });
      await user.save(); // Save the new user to the database
    }

    // --- Refresh Token Generation & Storage ---
    const newRefreshToken = uuidv4(); // Generate a unique refresh token (UUID)
    const refreshTokenExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // Expires in 7 days (example)

    // Delete any existing refresh token for this user to ensure only one is active per device/login
    await RefreshToken.deleteOne({ userId: user._id }); // Or update existing if you prefer

    // Save the new refresh token to the RefreshToken model
    await RefreshToken.create({
        token: newRefreshToken,
        userId: user._id,
        expiresAt: new Date(refreshTokenExpiry) // Store expiry in RefreshToken model
    });

    // --- Generate Access Token ---
    const accessTokenPayload = { // Define payload for access token
      id: user._id,
      username: user.username,
      isProvider: user.isProvider,
      isAdmin: user.isAdmin,
    };
    const accessToken = jwt.sign(accessTokenPayload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

    // --- Send both tokens and user info to the frontend ---
    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      user: { // Send back user info for immediate frontend use
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        isProvider: user.isProvider,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
      }
    });

  } catch (error) {
    console.error('Google login backend error:', error);
    if (error.code === 'ERR_INVALID_ARG_VALUE') {
      return res.status(401).json({ error: 'Invalid Google token provided.' });
    }
    res.status(500).json({ message: 'Internal server error during Google login.', error: error.message });
  }
};


/**
 * @desc    Generate a new access token using refresh token
 * @route   POST /api/auth/refresh-token
 * @access  Public (but requires valid refresh token)
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

    // Check if the stored refresh token has expired
    if (storedToken.expiresAt && storedToken.expiresAt < new Date()) {
        await RefreshToken.deleteOne({ token: refreshToken }); // Delete expired token
        return res.status(403).json({ message: 'Refresh token expired. Please log in again.' });
    }

    // Find the user associated with this refresh token
    const user = await User.findById(storedToken.userId); // Use storedToken.userId
    if (!user) {
        // If user not found, delete the refresh token as it's orphaned
        await RefreshToken.deleteOne({ token: refreshToken });
        return res.status(403).json({ message: 'User not found for this refresh token. Please log in again.' });
    }

    // --- Refresh Token Rotation (Optional but Recommended) ---
    // Invalidate the old refresh token and generate a new one
    await RefreshToken.deleteOne({ token: refreshToken }); // Delete the old token after use
    const newRefreshToken = uuidv4();
    const newRefreshTokenExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days expiry for new token
    await RefreshToken.create({
        token: newRefreshToken,
        userId: user._id,
        expiresAt: new Date(newRefreshTokenExpiry)
    });

    // Generate a new access token
    const newAccessTokenPayload = {
      id: user._id,
      username: user.username,
      isProvider: user.isProvider,
      isAdmin: user.isAdmin,
    };
    const newAccessToken = jwt.sign(newAccessTokenPayload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken }); // Return new refresh token too

  } catch (err) {
    console.error('Refresh token error:', err);
    // If jwt.verify fails for REFRESH_TOKEN_SECRET (if refresh tokens were JWTs)
    // or if any other error occurs, treat it as invalid.
    res.status(403).json({ message: 'Invalid or expired refresh token. Please log in again.', error: err.message });
  }
};

/**
 * @desc    Logout a user
 * @route   POST /api/auth/logout
 * @access  Private (requires access token for some implementations, or just refresh token)
 */
exports.logout = async (req, res) => {
  const { refreshToken } = req.body; // Expect refresh token in body to invalidate it
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
