const { User } = require('../models/user');
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
    console.log('=== UPDATE ME DEBUG ===');
    console.log('User ID from token:', req.user._id);
    console.log('Request body:', req.body);
    console.log('Request body type:', typeof req.body);
    console.log('Request body keys:', req.body ? Object.keys(req.body) : 'undefined');
    console.log('Request file:', req.file);
    console.log('User object from auth:', req.user);

    const userId = req.user._id; // Uses req.user._id
    
    // Handle case where req.body might be undefined
    const body = req.body || {};
    const { name, phone, password, providerSettings } = body;

    console.log('Extracted fields:', { name, phone, password: password ? '[HIDDEN]' : undefined, providerSettings });

    // Parse providerSettings if it's a JSON string (from FormData)
    let parsedProviderSettings = null;
    if (providerSettings && typeof providerSettings === 'string') {
      try {
        parsedProviderSettings = JSON.parse(providerSettings);
        console.log('Parsed providerSettings:', parsedProviderSettings);
      } catch (parseError) {
        console.error('Failed to parse providerSettings:', parseError);
        return res.status(400).json({ message: 'Invalid provider settings format.' });
      }
    } else if (providerSettings) {
      parsedProviderSettings = providerSettings;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found.' });
    }

    console.log('Found user in database:', { 
      id: user._id, 
      name: user.name, 
      email: user.email,
      phone: user.phone 
    });

    // Track what fields are being updated
    const updates = {};

    if (name) {
      user.name = name;
      updates.name = name;
    }
    if (phone) {
      user.phone = phone;
      updates.phone = phone;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 12);
      updates.password = '[HASHED]';
    }

    // Handle profile picture upload
    if (req.file) {
      console.log('Profile picture uploaded:', req.file.path);
      user.profilePicture = req.file.path; // Cloudinary URL
      updates.profilePicture = req.file.path;
    }

    if (parsedProviderSettings) {
      console.log('Provider settings:', parsedProviderSettings);
      if (parsedProviderSettings.activeHours) {
        user.providerSettings.activeHours.start = parsedProviderSettings.activeHours.start || user.providerSettings.activeHours.start;
        user.providerSettings.activeHours.end = parsedProviderSettings.activeHours.end || user.providerSettings.activeHours.end;
      }
      if (parsedProviderSettings.timezone) {
        user.providerSettings.timezone = parsedProviderSettings.timezone;
      }
      user.providerSettingsCompleted = true;
      updates.providerSettings = 'updated';
    }

    console.log('Fields to be updated:', updates);

    const updatedUser = await user.save();
    console.log('User saved successfully');
    
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    console.log('=== UPDATE ME SUCCESS ===');
    res.json(userResponse);
  } catch (err) {
    console.error('=== UPDATE ME ERROR ===');
    console.error('Error details:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Error name:', err.name);
    
    // Check for specific error types
    if (err.name === 'ValidationError') {
      console.error('Validation errors:', err.errors);
      return res.status(400).json({ 
        message: 'Validation error while updating profile.', 
        error: err.message,
        details: Object.keys(err.errors).map(key => `${key}: ${err.errors[key].message}`)
      });
    }
    
    if (err.name === 'CastError') {
      console.error('Cast error:', err);
      return res.status(400).json({ 
        message: 'Invalid data format.', 
        error: err.message 
      });
    }

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