// ============================================
// Like Model
// Contains all raw SQL queries related to the "likes" table
// ============================================
const db = require('../config/db');

const LikeModel = {
  // Like a post (user_id likes post_id)
  async likePost(postId, userId) {
    const [result] = await db.query(
      'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
      [postId, userId]
    );
    return result.insertId;
  },

  // Unlike a post
  async unlikePost(postId, userId) {
    await db.query('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
  },

  // Check if a user has already liked a post
  async hasLiked(postId, userId) {
    const [rows] = await db.query(
      'SELECT * FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );
    return rows.length > 0;
  },

  // Get total like count for a post
  async getLikeCount(postId) {
    const [rows] = await db.query('SELECT COUNT(*) AS count FROM likes WHERE post_id = ?', [postId]);
    return rows[0].count;
  },

  // Get list of users who liked a post
  async getUsersWhoLiked(postId) {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.profile_picture
       FROM likes l JOIN users u ON l.user_id = u.id
       WHERE l.post_id = ?`,
      [postId]
    );
    return rows;
  }
};

module.exports = LikeModel;
