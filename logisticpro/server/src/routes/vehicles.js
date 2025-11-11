const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Obtener todos los vehículos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear un nuevo vehículo
router.post('/', async (req, res) => {
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
