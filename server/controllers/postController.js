// ============================================
// Post Controller
// Handles create, read, update, delete for posts
// ============================================
const PostModel = require('../models/postModel');
const fs = require('fs');
const path = require('path');

// Helper to delete an image file from disk (used when editing/deleting posts)
const deleteImageFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(__dirname, '..', 'uploads', 'posts', filename);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') console.error('Error deleting image file:', err.message);
  });
};

// -------------------------------------------
// POST /api/posts
// Create a new post (with optional image)
// -------------------------------------------
const createPost = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Post content cannot be empty.' });
    }
    if (content.length > 2000) {
      return res.status(400).json({ success: false, message: 'Post content must be under 2000 characters.' });
    }

    const image = req.file ? req.file.filename : null;

    const postId = await PostModel.createPost({ user_id: req.user.id, content, image });
    const post = await PostModel.findById(postId);

    res.status(201).json({ success: true, message: 'Post created successfully.', post });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// GET /api/posts
// Get all posts (news feed), newest first
// -------------------------------------------
const getAllPosts = async (req, res, next) => {
  try {
    const posts = await PostModel.getAllPosts(req.user.id);
    res.status(200).json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// GET /api/posts/user/:userId
// Get all posts by a specific user (profile page)
// -------------------------------------------
const getPostsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const posts = await PostModel.getPostsByUser(userId, req.user.id);
    res.status(200).json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// GET /api/posts/:id
// Get a single post by id
// -------------------------------------------
const getPostById = async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }
    res.status(200).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// PUT /api/posts/:id
// Edit a post (only the owner can edit)
// -------------------------------------------
const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = await PostModel.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }
    if (post.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to edit this post.' });
    }
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Post content cannot be empty.' });
    }

    let image = null;
    if (req.file) {
      image = req.file.filename;
      deleteImageFile(post.image); // remove old image if a new one was uploaded
    }

    await PostModel.updatePost(id, { content, image });
    const updatedPost = await PostModel.findById(id);

    res.status(200).json({ success: true, message: 'Post updated successfully.', post: updatedPost });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// DELETE /api/posts/:id
// Delete a post (only the owner can delete)
// -------------------------------------------
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await PostModel.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }
    if (post.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this post.' });
    }

    deleteImageFile(post.image);
    await PostModel.deletePost(id);

    res.status(200).json({ success: true, message: 'Post deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPost, getAllPosts, getPostsByUser, getPostById, updatePost, deletePost };
