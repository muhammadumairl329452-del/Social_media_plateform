// ============================================
// Authentication Middleware
// Verifies the JWT token sent in the Authorization header
// Attaches the decoded user info (id) to req.user
// ============================================
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  try {
    // Expect header format: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided. Access denied.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload (contains user id) to the request object
    req.user = decoded;

    next(); // move on to the next middleware/controller
  } catch (error) {
    // Covers expired tokens, malformed tokens, invalid signatures, etc.
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
