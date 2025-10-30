// server/src/db/connection.js
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false } // Render necesita SSL
});


if (process.env.NODE_ENV !== 'test') {
  pool.connect()
    .then(() => console.log('✅ Conectado a PostgreSQL (Render)'))
    .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err.message));
}

pool.on('error', (err) => {
  console.error('Error inesperado en cliente idle', err);
});

module.exports = pool;


