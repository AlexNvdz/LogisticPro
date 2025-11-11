// server/src/db/setup.js
const fs = require('fs');
const path = require('path');
const pool = require('./connection');

async function init() {
  const sqlPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  try {
    await pool.query(sql);
    console.log('✅ DB schema applied (tables created)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error applying schema:', err);
    process.exit(1);
  }
}

init();
