const User = require('../models/user');
const bcrypt = require('bcryptjs'); // Required for password hashing

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    // Exclude password from the response for security
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, userType, isAdmin } = req.body;
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ error: 'All required fields are not provided.' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      userType,
      isAdmin: isAdmin || false
    });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    // Authorization check: Ensure the authenticated user (from req.user.id) is updating their own profile.
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own profile.' });
    }

    const updates = {};
    const bodyKeys = Object.keys(req.body);

    // Define fields that are allowed to be updated by a user for their own profile.
    // Exclude sensitive fields like userType, isAdmin from being directly updated here.
    const allowedTopLevelFields = [
      'name', 'username', 'phone',
      'businessName', 'businessDescription', 'businessCategory',
      'walletBalance', 'rating', 'totalRatings', 'isVerified', 'isActive'
    ];

    // Populate updates object with allowed top-level fields from req.body.
    allowedTopLevelFields.forEach(key => {
        // Ensure the field exists in req.body and is not a nested object, password, or profilePicture.
        if (bodyKeys.includes(key) && typeof req.body[key] !== 'object' && key !== 'password' && key !== 'profilePicture') {
            updates[key] = req.body[key];
        }
    });

    // Handle nested 'businessLocation' fields for providers.
    if (req.body.businessLocation) {
        // Assuming businessLocation is sent as a flat object or JSON string in FormData
        const businessLocationData = typeof req.body.businessLocation === 'string' ? JSON.parse(req.body.businessLocation) : req.body.businessLocation;
        updates['businessLocation.address'] = businessLocationData.address;
        updates['businessLocation.city'] = businessLocationData.city;
        updates['businessLocation.state'] = businessLocationData.state;
        updates['businessLocation.pincode'] = businessLocationData.pincode;
        // Handle nested coordinates within businessLocation
        if (businessLocationData.coordinates) {
            updates['businessLocation.coordinates.latitude'] = businessLocationData.coordinates.latitude;
            updates['businessLocation.coordinates.longitude'] = businessLocationData.coordinates.longitude;
        }
    }

    // Handle nested 'preferredLocation' fields for clients.
    if (req.body.preferredLocation) {
        const preferredLocationData = typeof req.body.preferredLocation === 'string' ? JSON.parse(req.body.preferredLocation) : req.body.preferredLocation;
        updates['preferredLocation.city'] = preferredLocationData.city;
        updates['preferredLocation.state'] = preferredLocationData.state;
    }

    // Handle top-level 'coordinates' if updated directly (not nested under businessLocation).
    if (req.body.coordinates) {
        const coordinatesData = typeof req.body.coordinates === 'string' ? JSON.parse(req.body.coordinates) : req.body.coordinates;
        updates['coordinates.latitude'] = coordinatesData.latitude;
        updates['coordinates.longitude'] = coordinatesData.longitude;
    }

    // Handle 'password' update: hash it if provided in the request body.
    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    // Handle 'profilePicture': If Multer (with CloudinaryStorage) processed a file, its URL is in req.file.path.
    if (req.file && req.file.path) {
        updates.profilePicture = req.file.path; // This will be the Cloudinary URL
    } else if (bodyKeys.includes('profilePicture') && req.body.profilePicture === '') {
        // If frontend explicitly sent an empty string for profilePicture, it means clear it.
        updates.profilePicture = '';
    }
    // If req.file is not present and req.body.profilePicture is not an empty string,
    // it means the frontend sent the existing URL (unchanged), so we don't need to update this field.

    // Find the user by ID and apply the updates.
    // { new: true } returns the updated document. { runValidators: true } ensures schema validation.
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    // Convert Mongoose document to a plain JavaScript object and remove the password before sending the response.
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);

  } catch (err) {
    // Handle Mongoose validation errors (e.g., required field missing, invalid data type).
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    // Handle Multer/file-related errors (e.g., file size limit exceeded, invalid file type).
    if (err.message && (err.message.includes('Invalid file type') || err.code === 'LIMIT_FILE_SIZE')) {
        return res.status(400).json({ error: err.message });
    }
    // Catch any other unexpected server errors.
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // This route should ideally also have an authorization check (e.g., only admin can delete others, or user can delete self)
    // Assuming 'admin' middleware handles it if present on the route.
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};