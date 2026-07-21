// ============================================
// File Upload Middleware (Multer)
// Handles image uploads for profile pictures and posts
// ============================================
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const profileDir = path.join(__dirname, '..', 'uploads', 'profiles');
const postDir = path.join(__dirname, '..', 'uploads', 'posts');
[profileDir, postDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// Filter to only accept image files
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed.'), false);
  }
};

// Storage engine for profile pictures
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profileDir),
  filename: (req, file, cb) => {
    // unique filename: userId-timestamp.extension
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user.id}-${Date.now()}${ext}`);
  }
});

// Storage engine for post images
const postStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, postDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `post-${req.user.id}-${Date.now()}${ext}`);
  }
});

const uploadLimits = { fileSize: 5 * 1024 * 1024 }; // 5 MB max

const uploadProfilePicture = multer({ storage: profileStorage, fileFilter, limits: uploadLimits });
const uploadPostImage = multer({ storage: postStorage, fileFilter, limits: uploadLimits });

module.exports = { uploadProfilePicture, uploadPostImage };
