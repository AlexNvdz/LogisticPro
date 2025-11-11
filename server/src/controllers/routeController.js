// server/src/controllers/routeController.js
const fetch = require('node-fetch');
const {pool} = require('../db/connection');

async function getAllRoutes(req, res) {
  try {
    const result = await pool.query('SELECT * FROM routes ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener rutas' });
  }
}

async function createRoute(req, res) {
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
}

module.exports = {
  getAllRoutes,
  createRoute
};
