// ============================================
// Database Configuration
// Creates a MySQL connection pool using mysql2
// ============================================
const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool (better than a single connection for handling
// multiple simultaneous requests in an Express app)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'social_media_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Use the promise-based wrapper so we can use async/await in controllers/models
const promisePool = pool.promise();

// Quick test to confirm the database connects on server startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error connecting to MySQL database:', err.message);
    return;
  }
  console.log('✅ Connected to MySQL database');
  connection.release();
});

module.exports = promisePool;
