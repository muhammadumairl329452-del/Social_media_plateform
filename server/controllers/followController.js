// ============================================
// Follow Controller
// Handles following, unfollowing, and viewing follow relationships
// ============================================
const FollowModel = require('../models/followModel');
const UserModel = require('../models/userModel');

// -------------------------------------------
// POST /api/users/:id/follow
// Follow a user
// -------------------------------------------
const followUser = async (req, res, next) => {
  try {
    const followingId = parseInt(req.params.id, 10);
    const followerId = req.user.id;

    if (followingId === followerId) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself.' });
    }

    const targetUser = await UserModel.findById(followingId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const alreadyFollowing = await FollowModel.isFollowing(followerId, followingId);
    if (alreadyFollowing) {
      return res.status(409).json({ success: false, message: 'You are already following this user.' });
    }

    await FollowModel.followUser(followerId, followingId);
    const followersCount = await FollowModel.getFollowersCount(followingId);

    res.status(201).json({ success: true, message: `You are now following ${targetUser.name}.`, followers_count: followersCount });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// DELETE /api/users/:id/follow
// Unfollow a user
// -------------------------------------------
const unfollowUser = async (req, res, next) => {
  try {
    const followingId = parseInt(req.params.id, 10);
    const followerId = req.user.id;

    const alreadyFollowing = await FollowModel.isFollowing(followerId, followingId);
    if (!alreadyFollowing) {
      return res.status(409).json({ success: false, message: 'You are not following this user.' });
    }

    await FollowModel.unfollowUser(followerId, followingId);
    const followersCount = await FollowModel.getFollowersCount(followingId);

    res.status(200).json({ success: true, message: 'Unfollowed successfully.', followers_count: followersCount });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// GET /api/users/:id/followers
// List a user's followers
// -------------------------------------------
const getFollowers = async (req, res, next) => {
  try {
    const followers = await FollowModel.getFollowers(req.params.id);
    res.status(200).json({ success: true, count: followers.length, followers });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// GET /api/users/:id/following
// List users a user is following
// -------------------------------------------
const getFollowing = async (req, res, next) => {
  try {
    const following = await FollowModel.getFollowing(req.params.id);
    res.status(200).json({ success: true, count: following.length, following });
  } catch (error) {
    next(error);
  }
};

module.exports = { followUser, unfollowUser, getFollowers, getFollowing };
