// server/src/routes/vehicles.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection'); // Importación correcta
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

// Obtener todos los vehículos
router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear un nuevo vehículo
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { plate, model, capacity, status } = req.body;
    const result = await pool.query(
      'INSERT INTO vehicles (plate, model, capacity, status) VALUES ($1, $2, $3, $4) RETURNING *',
      // Tu frontend envía 'available' o 'disponible', así que lo estandarizamos
      [plate, model, capacity, status || 'available'] 
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AÑADIDO: RUTA PARA EDITAR (PUT) ---
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { plate, model, capacity, status } = req.body;
    
    const result = await pool.query(
      'UPDATE vehicles SET plate = $1, model = $2, capacity = $3, status = $4 WHERE id = $5 RETURNING *',
      [plate, model, capacity, status || 'available', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AÑADIDO: RUTA PARA BORRAR (DELETE) ---
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    res.json({ ok: true, message: 'Vehículo eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;