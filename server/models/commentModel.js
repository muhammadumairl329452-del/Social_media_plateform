// ============================================
// Comment Model
// Contains all raw SQL queries related to the "comments" table
// ============================================
const db = require('../config/db');

const CommentModel = {
  // Add a comment to a post
  async createComment({ post_id, user_id, content }) {
    const [result] = await db.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [post_id, user_id, content]
    );
    return result.insertId;
  },

  // Get a single comment by id
  async findById(id) {
    const [rows] = await db.query('SELECT * FROM comments WHERE id = ?', [id]);
    return rows[0];
  },

  // Get all comments for a post, with commenter info, oldest first
  async getCommentsByPost(postId) {
    const [rows] = await db.query(
      `SELECT c.*, u.name AS author_name, u.profile_picture AS author_picture
       FROM comments c JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [postId]
    );
    return rows;
  },

  // Update comment content
  async updateComment(id, content) {
    await db.query('UPDATE comments SET content = ? WHERE id = ?', [content, id]);
  },

  // Delete a comment
  async deleteComment(id) {
    await db.query('DELETE FROM comments WHERE id = ?', [id]);
  }
};

module.exports = CommentModel;
