const User = require('../models/user');
const RefreshToken = require('../models/refreshtoken');
const bcrypt = require('bcryptjs');

// All routes here are assumed to be protected by isAuthenticated middleware in index.js.

/**
 * @desc    Get current authenticated user's profile
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password'); // Uses req.user._id
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

/**
 * @desc    Update current authenticated user's profile
 */
exports.updateMe = async (req, res) => {
  try {
    const userId = req.user._id; // Uses req.user._id
    const { name, phone, password, providerSettings } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    if (password) {
      user.password = await bcrypt.hash(password, 12);
    }

    if (providerSettings) {
      if (providerSettings.activeHours) {
        user.providerSettings.activeHours.start = providerSettings.activeHours.start || user.providerSettings.activeHours.start;
        user.providerSettings.activeHours.end = providerSettings.activeHours.end || user.providerSettings.activeHours.end;
      }
      if (providerSettings.timezone) {
        user.providerSettings.timezone = providerSettings.timezone;
      }
      user.providerSettingsCompleted = true;
    }

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ message: 'Server error while updating profile.', error: err.message });
  }
};

/**
 * @desc    Deactivate the currently logged-in user's account
 */
exports.deactivateMe = async (req, res) => {
    try {
        const userId = req.user._id; // Uses req.user._id
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.isActive = false;
        await user.save();

        // For manual JWTs, also delete refresh tokens to log out
        // For Firebase users, their session is managed by Firebase client SDK
        if (req.user.tokenType === 'custom_jwt') {
            await RefreshToken.deleteMany({ userId: userId });
        }

        res.status(200).json({ message: 'Your account has been successfully deactivated.' });

    } catch (err) {
        res.status(500).json({ message: 'Server error during account deactivation.', error: err.message });
    }
};

/**
 * @desc    Get a single user by ID (Admin only)
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

/**
 * @desc    Get all users (Admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};