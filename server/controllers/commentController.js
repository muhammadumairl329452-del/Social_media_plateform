// ============================================
// Comment Controller
// Handles add, edit, delete, and list for comments
// ============================================
const CommentModel = require('../models/commentModel');
const PostModel = require('../models/postModel');

// -------------------------------------------
// POST /api/posts/:postId/comments
// Add a comment to a post
// -------------------------------------------
const addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty.' });
    }
    if (content.length > 1000) {
      return res.status(400).json({ success: false, message: 'Comment must be under 1000 characters.' });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const commentId = await CommentModel.createComment({ post_id: postId, user_id: req.user.id, content });
    const comment = await CommentModel.findById(commentId);

    res.status(201).json({ success: true, message: 'Comment added successfully.', comment });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// GET /api/posts/:postId/comments
// Get all comments for a post
// -------------------------------------------
const getCommentsByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const comments = await CommentModel.getCommentsByPost(postId);
    res.status(200).json({ success: true, comments });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// PUT /api/comments/:id
// Edit a comment (only the owner can edit)
// -------------------------------------------
const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await CommentModel.findById(id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to edit this comment.' });
    }
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty.' });
    }

    await CommentModel.updateComment(id, content);
    const updatedComment = await CommentModel.findById(id);

    res.status(200).json({ success: true, message: 'Comment updated successfully.', comment: updatedComment });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// DELETE /api/comments/:id
// Delete a comment (only the owner can delete)
// -------------------------------------------
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await CommentModel.findById(id);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this comment.' });
    }

    await CommentModel.deleteComment(id);
    res.status(200).json({ success: true, message: 'Comment deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { addComment, getCommentsByPost, updateComment, deleteComment };
