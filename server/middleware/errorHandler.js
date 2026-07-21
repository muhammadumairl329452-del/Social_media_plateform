// ============================================
// Centralized Error Handling Middleware
// Catches errors passed via next(err) or thrown in async routes
// Must be registered LAST in server.js (after all routes)
// ============================================
const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  console.error('🔥 Error:', err.message);

  // Multer-specific errors (file too large, wrong type, etc.)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }

  // Custom file filter errors thrown in upload.js
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Duplicate entry. This record already exists.' });
  }

  // Default fallback: generic 500 server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong on the server.'
  });
};

// 404 handler for undefined routes
const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

module.exports = { errorHandler, notFound };
