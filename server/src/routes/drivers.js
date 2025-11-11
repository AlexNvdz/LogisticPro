const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
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
    const { name, license_number, phone, status } = req.body;
    const result = await pool.query(
      'INSERT INTO drivers (name, license_number, phone, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, license_number, phone, status || 'activo']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;