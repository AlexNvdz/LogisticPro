// server/src/routes/drivers.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection'); // Importación correcta
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

// Obtener todos los conductores
router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drivers ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CAMBIO AQUÍ ---
// Crear un nuevo conductor
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    // 1. Leemos los campos en INGLÉS (como los manda el frontend nuevo)
    const { name, phone, license_number } = req.body;
    
    // 2. Insertamos en las columnas correctas de la DB
    const result = await pool.query(
      'INSERT INTO drivers (name, license_number, phone) VALUES ($1, $2, $3) RETURNING *',
      [name, license_number, phone] // Usamos las variables en inglés
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creando conductor:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- AÑADIDO ---
// Editar un conductor
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, license_number } = req.body; // Leemos inglés
    
    const result = await pool.query(
      'UPDATE drivers SET name = $1, license_number = $2, phone = $3 WHERE id = $4 RETURNING *',
      [name, license_number, phone, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conductor no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error editando conductor:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- AÑADIDO ---
// Eliminar un conductor
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM drivers WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conductor no encontrado' });
    }
    res.json({ ok: true, message: 'Conductor eliminado' });
  } catch (err) {
    console.error("Error eliminando conductor:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;