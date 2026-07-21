// ============================================
// User Controller
// Handles profile viewing, editing, and search
// ============================================
const UserModel = require('../models/userModel');
const FollowModel = require('../models/followModel');

// -------------------------------------------
// GET /api/users/me
// Get the logged-in user's own profile
// -------------------------------------------
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await UserModel.getProfileWithStats(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, user: profile });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// GET /api/users/:id
// Get any user's public profile by id
// -------------------------------------------
const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await UserModel.getProfileWithStats(id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Also tell the frontend whether the logged-in user follows this profile
    const isFollowing = await FollowModel.isFollowing(req.user.id, id);

    res.status(200).json({ success: true, user: { ...profile, is_following: isFollowing } });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// PUT /api/users/me
// Edit the logged-in user's profile (name, bio, profile picture)
// -------------------------------------------
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
    }
    if (bio && bio.length > 500) {
      return res.status(400).json({ success: false, message: 'Bio must be under 500 characters.' });
    }

    // If a file was uploaded via multer, req.file will be populated
    const profile_picture = req.file ? req.file.filename : null;

    await UserModel.updateProfile(req.user.id, { name, bio: bio || '', profile_picture });

    const updatedProfile = await UserModel.getProfileWithStats(req.user.id);
    res.status(200).json({ success: true, message: 'Profile updated successfully.', user: updatedProfile });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// GET /api/users/search?q=query
// Search users by name
// -------------------------------------------
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Search query is required.' });
    }
    const users = await UserModel.searchUsers(q, req.user.id);
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyProfile, getUserProfile, updateProfile, searchUsers };
