// ============================================
// Follow Model
// Contains all raw SQL queries related to the "followers" table
// ============================================
const db = require('../config/db');

const FollowModel = {
  // followerId starts following followingId
  async followUser(followerId, followingId) {
    const [result] = await db.query(
      'INSERT INTO followers (follower_id, following_id) VALUES (?, ?)',
      [followerId, followingId]
    );
    return result.insertId;
  },

  // followerId unfollows followingId
  async unfollowUser(followerId, followingId) {
    await db.query(
      'DELETE FROM followers WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
  },

  // Check if followerId already follows followingId
  async isFollowing(followerId, followingId) {
    const [rows] = await db.query(
      'SELECT * FROM followers WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
    return rows.length > 0;
  },

  // Get list of followers of a user
  async getFollowers(userId) {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.profile_picture
       FROM followers f JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = ?`,
      [userId]
    );
    return rows;
  },

  // Get list of users a user is following
  async getFollowing(userId) {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.profile_picture
       FROM followers f JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = ?`,
      [userId]
    );
    return rows;
  },

  async getFollowersCount(userId) {
    const [rows] = await db.query('SELECT COUNT(*) AS count FROM followers WHERE following_id = ?', [userId]);
    return rows[0].count;
  },

  async getFollowingCount(userId) {
    const [rows] = await db.query('SELECT COUNT(*) AS count FROM followers WHERE follower_id = ?', [userId]);
    return rows[0].count;
  }
};

module.exports = FollowModel;
