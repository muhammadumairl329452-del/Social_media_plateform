// ============================================
// Like Routes
// Nested under: /api/posts/:postId
// ============================================
const express = require('express');
const router = express.Router({ mergeParams: true });

const { likePost, unlikePost, getLikes } = require('../controllers/likeController');

router.post('/like', likePost);       // POST /api/posts/:postId/like
router.delete('/like', unlikePost);   // DELETE /api/posts/:postId/like
router.get('/likes', getLikes);       // GET /api/posts/:postId/likes

module.exports = router;
