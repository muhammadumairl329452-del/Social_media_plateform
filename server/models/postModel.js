// ============================================
// Post Model
// Contains all raw SQL queries related to the "posts" table
// ============================================
const db = require('../config/db');

const PostModel = {
  // Create a new post
  async createPost({ user_id, content, image }) {
    const [result] = await db.query(
      'INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)',
      [user_id, content, image]
    );
    return result.insertId;
  },

  // Get a single post by id (with author info)
  async findById(id) {
    const [rows] = await db.query(
      `SELECT p.*, u.name AS author_name, u.profile_picture AS author_picture
       FROM posts p JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  },

  // Get all posts (news feed), newest first, with author info + like/comment counts.
  // If currentUserId is provided, also indicates whether that user liked each post.
  async getAllPosts(currentUserId) {
    const [rows] = await db.query(
      `SELECT 
        p.id, p.user_id, p.content, p.image, p.created_at, p.updated_at,
        u.name AS author_name, u.profile_picture AS author_picture,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
        EXISTS(SELECT 1 FROM likes l2 WHERE l2.post_id = p.id AND l2.user_id = ?) AS liked_by_me
       FROM posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`,
      [currentUserId || 0]
    );
    return rows;
  },

  // Get all posts by a specific user (for profile page)
  async getPostsByUser(userId, currentUserId) {
    const [rows] = await db.query(
      `SELECT 
        p.id, p.user_id, p.content, p.image, p.created_at, p.updated_at,
        u.name AS author_name, u.profile_picture AS author_picture,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
        EXISTS(SELECT 1 FROM likes l2 WHERE l2.post_id = p.id AND l2.user_id = ?) AS liked_by_me
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [currentUserId || 0, userId]
    );
    return rows;
  },

  // Update a post's content and/or image
  async updatePost(id, { content, image }) {
    if (image) {
      await db.query('UPDATE posts SET content = ?, image = ? WHERE id = ?', [content, image, id]);
    } else {
      await db.query('UPDATE posts SET content = ? WHERE id = ?', [content, id]);
    }
  },

  // Delete a post
  async deletePost(id) {
    await db.query('DELETE FROM posts WHERE id = ?', [id]);
  }
};

module.exports = PostModel;
