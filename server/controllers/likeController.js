// ============================================
// Like Controller
// Handles liking, unliking, and viewing likes on posts
// ============================================
const LikeModel = require('../models/likeModel');
const PostModel = require('../models/postModel');

// -------------------------------------------
// POST /api/posts/:postId/like
// Like a post
// -------------------------------------------
const likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const alreadyLiked = await LikeModel.hasLiked(postId, req.user.id);
    if (alreadyLiked) {
      return res.status(409).json({ success: false, message: 'You already liked this post.' });
    }

    await LikeModel.likePost(postId, req.user.id);
    const likeCount = await LikeModel.getLikeCount(postId);

    res.status(201).json({ success: true, message: 'Post liked.', like_count: likeCount });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// DELETE /api/posts/:postId/like
// Unlike a post
// -------------------------------------------
const unlikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const alreadyLiked = await LikeModel.hasLiked(postId, req.user.id);
    if (!alreadyLiked) {
      return res.status(409).json({ success: false, message: 'You have not liked this post.' });
    }

    await LikeModel.unlikePost(postId, req.user.id);
    const likeCount = await LikeModel.getLikeCount(postId);

    res.status(200).json({ success: true, message: 'Post unliked.', like_count: likeCount });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// GET /api/posts/:postId/likes
// Get list of users who liked a post + total count
// -------------------------------------------
const getLikes = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const users = await LikeModel.getUsersWhoLiked(postId);
    res.status(200).json({ success: true, like_count: users.length, users });
  } catch (error) {
    next(error);
  }
};

module.exports = { likePost, unlikePost, getLikes };
