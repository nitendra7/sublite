const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sublite_profile_pictures',
    format: async (_req, _file) => 'png',
    public_id: (_req, file) => `profile-${file.originalname}-${Date.now()}`,
    transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }]
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 2 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images (jpeg, jpg, png, gif, webp) are allowed!'));
    }
  }
}).single('profilePicture');

module.exports = upload;