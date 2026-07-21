// ============================================
// User Model
// Contains all raw SQL queries related to the "users" table
// ============================================
const db = require('../config/db');

const UserModel = {
  // Create a new user, returns the inserted row's id
  async createUser({ name, email, hashedPassword }) {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    return result.insertId;
  },

  // Find a user by email (used during login/registration checks)
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  // Find a user by id
  async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, bio, profile_picture, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  // Update profile fields (name, bio, and optionally profile_picture)
  async updateProfile(id, { name, bio, profile_picture }) {
    if (profile_picture) {
      await db.query(
        'UPDATE users SET name = ?, bio = ?, profile_picture = ? WHERE id = ?',
        [name, bio, profile_picture, id]
      );
    } else {
      await db.query(
        'UPDATE users SET name = ?, bio = ? WHERE id = ?',
        [name, bio, id]
      );
    }
  },

  // Get public profile info + follower/following counts + post count
  async getProfileWithStats(id) {
    const [rows] = await db.query(
      `SELECT 
        u.id, u.name, u.email, u.bio, u.profile_picture, u.created_at,
        (SELECT COUNT(*) FROM followers WHERE following_id = u.id) AS followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id = u.id) AS following_count,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS posts_count
       FROM users u WHERE u.id = ?`,
      [id]
    );
    return rows[0];
  },

  // Search users by name (for follow suggestions / search bar)
  async searchUsers(query, excludeUserId) {
    const [rows] = await db.query(
      `SELECT id, name, bio, profile_picture FROM users 
       WHERE name LIKE ? AND id != ? LIMIT 20`,
      [`%${query}%`, excludeUserId]
    );
    return rows;
  }
};

module.exports = UserModel;
