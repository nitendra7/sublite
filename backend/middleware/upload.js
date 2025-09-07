// backend/middleware/upload.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary using environment variables (CLOUDINARY_URL is auto-detected).
cloudinary.config();

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
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images (jpeg, jpg, png, gif, webp) are allowed!'));
    }
  }
}).single('profilePicture'); // 'profilePicture' is the field name from frontend FormData

module.exports = upload;