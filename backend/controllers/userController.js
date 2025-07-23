const User = require('../models/user');
const RefreshToken = require('../models/refreshtoken'); // Needed to log user out
const bcrypt = require('bcryptjs');

/**
 * @desc    Get current authenticated user's profile
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
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
    const userId = req.user.id;
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
 * @route   DELETE /api/users/me
 */
exports.deactivateMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Set the user to inactive
        user.isActive = false;
        // You might want to anonymize some data here as well, e.g., user.email = `${user._id}@deleted.com`;
        await user.save();

        // Log the user out by deleting all their refresh tokens
        await RefreshToken.deleteMany({ userId: userId });

        res.status(200).json({ message: 'Your account has been successfully deactivated.' });

    } catch (err) {
        res.status(500).json({ message: 'Server error during account deactivation.', error: err.message });
    }
};


// --- Admin-only functions ---
// (getAllUsers, getUserById, etc. remain the same)


/**
 * @desc    Get a single user by ID (Admin only)
 * @route   GET /api/users/:id
 */
exports.getUserById = async (req, res) => { // 
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    // Handle CastError for invalid IDs (e.g., if ID is not a valid MongoDB ObjectId)
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