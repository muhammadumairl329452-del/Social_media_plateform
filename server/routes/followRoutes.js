// ============================================
// Follow Routes
// Nested under: /api/users/:id
// mergeParams allows access to :id from the parent router (userRoutes)
// ============================================
const express = require('express');
const router = express.Router({ mergeParams: true });

const { followUser, unfollowUser, getFollowers, getFollowing } = require('../controllers/followController');

// Note: authMiddleware is already applied by the parent router (userRoutes.js)

router.post('/follow', followUser);       // POST /api/users/:id/follow
router.delete('/follow', unfollowUser);   // DELETE /api/users/:id/follow
router.get('/followers', getFollowers);   // GET /api/users/:id/followers
router.get('/following', getFollowing);   // GET /api/users/:id/following

module.exports = router;
