// ============================================
// Mini Social Media Platform - Server Entry Point
// ============================================
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

// Middleware imports
const { errorHandler, notFound } = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

// Initialize the database connection (also verifies connectivity on startup)
require('./config/db');

const app = express();

// ---------- Global Middleware ----------
app.use(cors());                          // Allow cross-origin requests from the frontend
app.use(express.json());                  // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (form data)

// Serve uploaded images statically so the frontend can display them
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- API Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Standalone comment edit/delete routes: /api/comments/:id
app.use('/api/comments', authMiddleware, commentRoutes.standaloneRouter);

// Simple health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running.' });
});

// ---------- Error Handling ----------
app.use(notFound);      // 404 handler for unmatched routes
app.use(errorHandler);  // centralized error handler (must be last)

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
