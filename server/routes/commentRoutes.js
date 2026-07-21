// ============================================
// Comment Routes
// - POST/GET nested under: /api/posts/:postId/comments
// - PUT/DELETE standalone under: /api/comments/:id
// ============================================
const express = require('express');
const router = express.Router({ mergeParams: true });

const { addComment, getCommentsByPost, updateComment, deleteComment } = require('../controllers/commentController');

// Nested routes (mounted at /api/posts/:postId/comments in postRoutes.js)
router.post('/', addComment);
router.get('/', getCommentsByPost);

// Separate router for direct comment edit/delete by comment id
const standaloneRouter = express.Router();
standaloneRouter.put('/:id', updateComment);     // PUT /api/comments/:id
standaloneRouter.delete('/:id', deleteComment);  // DELETE /api/comments/:id

module.exports = router;
module.exports.standaloneRouter = standaloneRouter;
