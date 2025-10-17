// server/src/routes/routes.js
const express = require('express');
const pool = require('../db/connection');
const router = express.Router();

// GET todas las rutas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM routes ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener rutas' });
  }
});

// POST crear una ruta
router.post('/', async (req, res) => {
  const { origin, destination, distance_km, estimated_time, vehicle_id, order_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO routes (origin, destination, distance_km, estimated_time, vehicle_id, order_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [origin, destination, distance_km, estimated_time, vehicle_id, order_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear ruta' });
  }
});

module.exports = router;
