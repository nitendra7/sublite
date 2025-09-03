
const { User } = require('../models/user');
const RefreshToken = require('../models/refreshtoken');
const bcrypt = require('bcryptjs');

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

exports.updateMe = async (req, res) => {
  try {
    const userId = req.user._id;
    const name = req.body.name;
    const phone = req.body.phone;
    const password = req.body.password;
    let providerSettings;
    if (req.body.providerSettings) {
      try {
        providerSettings = typeof req.body.providerSettings === 'string'
          ? JSON.parse(req.body.providerSettings)
          : req.body.providerSettings;
      } catch (e) {
        return res.status(400).json({ message: 'Invalid providerSettings format. Must be valid JSON.' });
      }
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (password) user.password = await bcrypt.hash(password, 12);
    if (providerSettings) {
      if (!user.providerSettings || typeof user.providerSettings !== 'object') user.providerSettings = {};
      if (providerSettings.activeHours) {
        if (!user.providerSettings.activeHours || typeof user.providerSettings.activeHours !== 'object') user.providerSettings.activeHours = {};
        if ('start' in providerSettings.activeHours) user.providerSettings.activeHours.start = providerSettings.activeHours.start;
        if ('end' in providerSettings.activeHours) user.providerSettings.activeHours.end = providerSettings.activeHours.end;
      }
      if ('timezone' in providerSettings) user.providerSettings.timezone = providerSettings.timezone;
      user.providerSettingsCompleted = true;
    }
    if (req.file && req.file.path) {
      user.profilePicture = req.file.path;
    } else if (req.file && req.file.filename) {
      user.profilePicture = req.file.filename;
    }
    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    if (!userResponse.profilePicture) {
      userResponse.profilePicture = user.profilePicture || '/logos/logo.png';
    }
    res.json(userResponse);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error while updating profile.', error: err.message });
  }
};

exports.deactivateMe = async (req, res) => {
    try {
        const userId = req.user._id; // Uses req.user._id
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.isActive = false;
        await user.save();

        if (req.user.tokenType === 'custom_jwt') {
            await RefreshToken.deleteMany({ userId: userId });
        }

        res.status(200).json({ message: 'Your account has been successfully deactivated.' });

    } catch (err) {
        res.status(500).json({ message: 'Server error during account deactivation.', error: err.message });
    }
};

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

exports.deleteUserById = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "Admins cannot delete themselves." });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "Admins cannot change their own admin status." });
    }
    const { isAdmin } = req.body;
    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({ message: 'isAdmin must be a boolean.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.isAdmin = isAdmin;
    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(200).json(userResponse);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.onboardProfile = async (req, res) => {
    try {
        const { firebaseUid, email, name, username } = req.body;

        // Security: ensure the firebaseUid matches the authenticated user's UID
        if (req.user && req.user.firebaseUid && req.user.firebaseUid !== firebaseUid) {
            return res.status(403).json({ message: 'Unauthorized: Cannot onboard profile for another user.' });
        }

        let user = await User.findOne({ firebaseUid });

        if (user) {
            let updated = false;
            if (name && user.name !== name) { user.name = name; updated = true; }
            if (username && user.username !== username) { user.username = username; updated = true; }
            if (updated) {
                await user.save();
                return res.status(200).json({ message: 'User profile updated successfully.', userProfile: user });
            } else {
                return res.status(200).json({ message: 'User profile already up to date.' });
            }
        } else {
            user = new User({
                firebaseUid: firebaseUid,
                email: email,
                name: name,
                username: username,
                isSocialLogin: true
            });
            await user.save();
            return res.status(201).json({ message: 'User profile created successfully.', userProfile: user });
        }

    } catch (error) {
        console.error('Server error during profile onboarding/sync:', error);
        res.status(500).json({ message: 'Server error during profile sync.', error: error.message });
    }
};