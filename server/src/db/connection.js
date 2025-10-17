// server/src/db/connection.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'loguser',
  password: process.env.DB_PASS || 'secret',
  database: process.env.DB_NAME || 'logisticpro',
});

pool.on('connect', () => console.log('✅ Connected to PostgreSQL (pg Pool)'));
pool.on('error', (err) => console.error('PG Pool error', err));

module.exports = pool;
