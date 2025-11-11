// server/src/controllers/vehiclesController.js
const {pool} = require('../db/connection');
const isNonEmpty = v => typeof v === 'string' && v.trim().length > 0;

module.exports = {
  async getAllVehicles(req, res) {
    try {
      const { rows } = await pool.query('SELECT id, plate, model, capacity, status, created_at FROM vehicles ORDER BY id DESC');
      res.json(rows);
    } catch (err) {
      console.error('getAllVehicles', err);
      res.status(500).json({ error: 'DB error' });
    }
  },

  async getVehicleById(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

    try {
      const { rows } = await pool.query('SELECT id, plate, model, capacity, status, created_at FROM vehicles WHERE id=$1', [id]);
      if (!rows.length) return res.status(404).json({ error: 'Vehicle not found' });
      res.json(rows[0]);
    } catch (err) {
      console.error('getVehicleById', err);
      res.status(500).json({ error: 'DB error' });
    }
  },

  async createVehicle(req, res) {
    const { plate, model, capacity, status } = req.body;
    if (!isNonEmpty(plate)) return res.status(400).json({ error: 'plate is required' });

    try {
      const q = `INSERT INTO vehicles (plate, model, capacity, status) VALUES ($1,$2,$3,$4) RETURNING id, plate, model, capacity, status, created_at`;
      const values = [plate.trim(), model || null, capacity ? Number(capacity) : 0, status || 'available'];
      const { rows } = await pool.query(q, values);
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error('createVehicle', err);
      if (err.code === '23505') return res.status(409).json({ error: 'Vehicle plate already exists' });
      res.status(500).json({ error: 'DB error' });
    }
  },

  async updateVehicle(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

    const fields = [];
    const values = [];
    let idx = 1;
    const { plate, model, capacity, status } = req.body;
    if (plate && isNonEmpty(plate)) { fields.push(`plate=$${idx++}`); values.push(plate.trim()); }
    if (model) { fields.push(`model=$${idx++}`); values.push(model); }
    if (capacity !== undefined) { fields.push(`capacity=$${idx++}`); values.push(Number(capacity)); }
    if (status) { fields.push(`status=$${idx++}`); values.push(status); }

    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

    const query = `UPDATE vehicles SET ${fields.join(', ')} WHERE id=$${idx} RETURNING id, plate, model, capacity, status, created_at`;
    values.push(id);

    try {
      const { rows } = await pool.query(query, values);
      if (!rows.length) return res.status(404).json({ error: 'Vehicle not found' });
      res.json(rows[0]);
    } catch (err) {
      console.error('updateVehicle', err);
      if (err.code === '23505') return res.status(409).json({ error: 'Vehicle plate already exists' });
      res.status(500).json({ error: 'DB error' });
    }
  },

  async deleteVehicle(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

    try {
      const { rowCount } = await pool.query('DELETE FROM vehicles WHERE id=$1', [id]);
      if (!rowCount) return res.status(404).json({ error: 'Vehicle not found' });
      res.json({ ok: true, deletedId: id });
    } catch (err) {
      console.error('deleteVehicle', err);
      res.status(500).json({ error: 'DB error' });
    }
  }
};
