const mysql = require('mysql2/promise');

/**
 * MySQL connection pool.
 * All config is read from environment variables — set them in your .env file.
 */
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306', 10),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'vikinggrill',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  dateStrings:        true, // return DATE columns as 'YYYY-MM-DD' strings
});

module.exports = pool;
