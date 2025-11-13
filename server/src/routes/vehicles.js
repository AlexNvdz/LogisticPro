const express = require('express');
const router = express.Router();
// --- CAMBIO AQUÍ ---
const {pool} = require('../db/connection'); // Añadimos las llaves {}
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

// Obtener todos los vehículos (solo admins)
router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear un nuevo vehículo (solo admins)
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { plate, model, capacity, status } = req.body;
    const result = await pool.query(
      'INSERT INTO vehicles (plate, model, capacity, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [plate, model, capacity, status || 'disponible']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;