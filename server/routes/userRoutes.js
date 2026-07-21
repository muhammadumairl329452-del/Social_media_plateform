// ============================================
// User Routes
// Base path: /api/users
// ============================================
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const { uploadProfilePicture } = require('../middleware/upload');
const { getMyProfile, getUserProfile, updateProfile, searchUsers } = require('../controllers/userController');
const followRoutes = require('./followRoutes');

// All user routes require authentication
router.use(authMiddleware);

// Search users (must come before /:id to avoid route collision)
router.get('/search', searchUsers);

// Logged-in user's own profile
router.get('/me', getMyProfile);
router.put('/me', uploadProfilePicture.single('profile_picture'), updateProfile);

// Follow/unfollow/followers/following routes nested under /:id
router.use('/:id', followRoutes);

// Public profile lookup by id
router.get('/:id', getUserProfile);

module.exports = router;
