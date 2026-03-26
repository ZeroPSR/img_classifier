const { Pool } = require('pg');

// Create database connection pool
const pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
    console.log('Database connection established');
});

pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
});

module.exports = pool;
