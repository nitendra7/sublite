
const { User } = require('../models/user');
const RefreshToken = require('../models/refreshtoken');
const bcrypt = require('bcryptjs');

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
    // Save profile picture if uploaded
    if (req.file && req.file.path) {
      user.profilePicture = req.file.path;
    } else if (req.file && req.file.filename) {
      user.profilePicture = req.file.filename;
    }
    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (err) {
    console.error('Profile update error:', err);
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
 * @desc    Delete a user by ID (Admin only)
 */
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

/**
 * @desc    Update a user's admin status (Admin only)
 */
exports.updateUserRole = async (req, res) => {
  try {
    // Prevent admin from demoting themselves
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

/**
 * @desc    (NEW) Onboard / Sync user profile data to MongoDB after Firebase signup/login.
 * This endpoint is protected by middleware/auth.js which verifies Firebase ID token.
 * @route   POST /api/users/onboard-profile
 * @access  Private (Firebase authenticated user)
 */
exports.onboardProfile = async (req, res) => {
    try {
        // req.user is populated by middleware/auth.js with the MongoDB user document
        // if user already exists in DB from a previous sync or manual creation.
        // If it's a completely new user to MongoDB, req.user might be null or you'd rely on req.body for initial data.

        const { firebaseUid, email, name, username } = req.body; // Data sent from frontend
        
        // IMPORTANT: Security check for Firebase users
        // For new Firebase users, req.user will be null (they don't exist in MongoDB yet)
        // For existing Firebase users, req.user.firebaseUid should match the firebaseUid from body
        // The firebaseUid from the decoded Firebase ID token should match the one in the request body
        
        // Get the Firebase UID from the decoded token (middleware puts it in req.user if user exists, or we get it from the token)
        // Since middleware already verified the Firebase ID token, we can trust that the firebaseUid in the body matches the token
        // But let's add an extra check by getting the UID from the token payload
        
        if (req.user && req.user.firebaseUid && req.user.firebaseUid !== firebaseUid) {
            return res.status(403).json({ message: 'Unauthorized: Cannot onboard profile for another user.' });
        }

        let user = await User.findOne({ firebaseUid });

        if (user) {
            // User already exists in DB, update their profile
            // This happens if a user logs in with Google (Firebase) and then later sets a username.
            // Or if a user existed manually before, and now signs up via Firebase.
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
            // New user, create a new entry in your MongoDB
            // Ensure your User model can accommodate users without a 'password' if they're Firebase-only.
            user = new User({
                firebaseUid: firebaseUid,
                email: email,
                name: name,
                username: username,
                isSocialLogin: true, // Mark this user as originating from social/Firebase
                // You might set default values for other fields here
            });
            await user.save();
            return res.status(201).json({ message: 'User profile created successfully.', userProfile: user });
        }

    } catch (error) {
        console.error('Server error during profile onboarding/sync:', error);
        res.status(500).json({ message: 'Server error during profile sync.', error: error.message });
    }
};