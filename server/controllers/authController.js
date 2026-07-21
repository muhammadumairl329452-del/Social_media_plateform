// ============================================
// Auth Controller
// Handles register, login, and logout logic
// ============================================
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const UserModel = require('../models/userModel');

const SALT_ROUNDS = 10;

// Basic email format validation
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Helper to generate a signed JWT for a user
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// -------------------------------------------
// POST /api/auth/register
// -------------------------------------------
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // ---- Validation ----
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are all required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Check for existing user
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const userId = await UserModel.createUser({ name, email, hashedPassword });

    // Generate token so the user is logged in immediately after registering
    const token = generateToken(userId);
    const user = await UserModel.findById(userId);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user
    });
  } catch (error) {
    next(error); // pass to centralized error handler
  }
};

// -------------------------------------------
// POST /api/auth/login
// -------------------------------------------
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const existingUser = await UserModel.findByEmail(email);
    if (!existingUser) {
      // Generic message to avoid revealing whether the email exists
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(existingUser.id);

    // Strip password before sending user back
    delete existingUser.password;

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: existingUser
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// POST /api/auth/logout
// Since JWT is stateless, logout is handled client-side by deleting the token.
// This endpoint exists for a consistent API and potential future blacklist logic.
// -------------------------------------------
const logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully. Please remove the token on the client.' });
};

module.exports = { register, login, logout };
