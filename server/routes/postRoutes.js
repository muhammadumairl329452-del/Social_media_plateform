// ============================================
// Post Routes
// Base path: /api/posts
// ============================================
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const { uploadPostImage } = require('../middleware/upload');
const {
  createPost,
  getAllPosts,
  getPostsByUser,
  getPostById,
  updatePost,
  deletePost
} = require('../controllers/postController');

const commentRoutes = require('./commentRoutes');
const likeRoutes = require('./likeRoutes');

// All post routes require authentication
router.use(authMiddleware);

// Feed & CRUD
router.post('/', uploadPostImage.single('image'), createPost);
router.get('/', getAllPosts);
router.get('/user/:userId', getPostsByUser);
router.get('/:id', getPostById);
router.put('/:id', uploadPostImage.single('image'), updatePost);
router.delete('/:id', deletePost);

// Nested: /api/posts/:postId/comments
router.use('/:postId/comments', commentRoutes);

// Nested: /api/posts/:postId/like, /api/posts/:postId/likes
router.use('/:postId', likeRoutes);

module.exports = router;
