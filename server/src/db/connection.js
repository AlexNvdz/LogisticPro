// server/src/db/connection.js
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_LOCAL;

const pool = new Pool({
  connectionString,
  // For Render external connections you need SSL. Internal may not, but this is safe:
  ssl: connectionString ? { rejectUnauthorized: false } : false,
  // opcional: idleTimeoutMillis, connectionTimeoutMillis
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;

