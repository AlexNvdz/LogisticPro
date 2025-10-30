// server/src/scripts/seedUser.js
require('dotenv').config();
const pool = require('../db/connection'); // ajusta la ruta si tu connection.js está en otro lugar

async function seed() {
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at`,
      ['Usuario Prueba', 'usuario.prueba@example.com', 'admin']
    );
    console.log('Usuario creado:', rows[0]);
  } catch (err) {
    // si ya existe email (unique) se muestra el error
    console.error('Error creando usuario:', err.code || err.message || err);
  } finally {
    await pool.end(); // cierra pool
    process.exit(0);
  }
}

seed();
