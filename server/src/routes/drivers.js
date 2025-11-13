// server/src/routes/drivers.js
const express = require('express');
const router = express.Router();
// Importación corregida (con llaves)
const { pool } = require('../db/connection'); 
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

// Obtener todos los conductores (solo admins)
router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drivers ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear un nuevo conductor (solo admins)
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    // 1. Leemos los campos que SÍ manda el frontend
    const { nombre, telefono, licencia_conduccion } = req.body;
    
    // 2. Insertamos en las columnas correctas de la DB
    //    (nombre -> name, licencia_conduccion -> license_number)
    const result = await pool.query(
      'INSERT INTO drivers (name, license_number, phone) VALUES ($1, $2, $3) RETURNING *',
      [nombre, licencia_conduccion, telefono] 
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creando conductor:", err); // Añadimos un log
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;