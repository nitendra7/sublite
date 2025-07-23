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
        
        // IMPORTANT: Ensure req.user._id (from decoded Firebase ID token) matches firebaseUid from body
        // This is a security check: user can only onboard/sync their OWN profile.
        if (req.user.firebaseUid !== firebaseUid) { // Assuming middleware/auth.js attaches firebaseUid to req.user
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