// server/src/routes/warehouses.js
const express = require('express');
const pool = require('../db/connection');
const router = express.Router();

// GET todos los almacenes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM warehouses ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener almacenes' });
  }
});

// POST crear un almacén
router.post('/', async (req, res) => {
  const { name, location, capacity, manager, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO warehouses (name, location, capacity, manager, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, location, capacity || 0, manager, status || 'activo']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear almacén' });
  }
});

// PUT editar un almacén
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, location, capacity, manager, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE warehouses
       SET name = $1, location = $2, capacity = $3, manager = $4, status = $5
       WHERE id = $6
       RETURNING *`,
      [name, location, capacity || 0, manager, status || 'activo', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Almacén no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al editar almacén' });
  }
});

// DELETE eliminar un almacén
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM warehouses WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Almacén no encontrado' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar almacén' });
  }
});

module.exports = router;
