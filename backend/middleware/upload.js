// backend/middleware/upload.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary using environment variables (CLOUDINARY_URL is auto-detected).
cloudinary.config();

console.log('Cloudinary config check:', {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key ? 'present' : 'missing',
  api_secret: cloudinary.config().api_secret ? 'present' : 'missing'
});

// Configure Cloudinary storage for Multer.
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sublite_profile_pictures', // Cloudinary folder
    format: async (req, file) => 'png', // File format
    public_id: (req, file) => `profile-${req.user.id}-${Date.now()}`, // Unique public ID
    transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }] // Image transformation
  },
});

// Initialize Multer upload middleware.
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 2 }, // 2MB file size limit
  fileFilter: (req, file, cb) => {
    console.log('File upload attempt:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.error('Invalid file type:', file.mimetype);
      cb(new Error('Invalid file type. Only images (jpeg, jpg, png, gif) are allowed!'));
    }
  }
}).single('profilePicture'); // 'profilePicture' is the field name from frontend FormData

// Wrap the upload middleware with error handling
const uploadWithErrorHandling = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Upload middleware error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 2MB.' });
        }
        return res.status(400).json({ message: 'File upload error: ' + err.message });
      }
      return res.status(400).json({ message: err.message });
    }
    
    console.log('Upload middleware success:', {
      hasFile: !!req.file,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      } : null
    });
    
    next();
  });
};

module.exports = uploadWithErrorHandling;