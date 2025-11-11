// server/src/controllers/clientsController.js
const pool = require('../db/connection'); // debe apuntar a ../db/connection.js

const isNonEmpty = v => typeof v === 'string' && v.trim().length > 0;

module.exports = {
  async getAllClients(req, res) {
    try {
      const { rows } = await pool.query('SELECT id, name, contact_email, contact_phone, address, created_at FROM clients ORDER BY id DESC');
      res.json(rows);
    } catch (err) {
      console.error('getAllClients', err);
      res.status(500).json({ error: 'DB error' });
    }
  },

  async getClientById(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    try {
      const { rows } = await pool.query('SELECT id, name, contact_email, contact_phone, address, created_at FROM clients WHERE id=$1', [id]);
      if (!rows.length) return res.status(404).json({ error: 'Client not found' });
      res.json(rows[0]);
    } catch (err) {
      console.error('getClientById', err);
      res.status(500).json({ error: 'DB error' });
    }
  },

  async createClient(req, res) {
    const { name, contact_email, contact_phone, address } = req.body;
    if (!isNonEmpty(name)) return res.status(400).json({ error: 'name is required' });
    try {
      const q = `INSERT INTO clients (name, contact_email, contact_phone, address)
                 VALUES ($1,$2,$3,$4) RETURNING id, name, contact_email, contact_phone, address, created_at`;
      const values = [name.trim(), contact_email || null, contact_phone || null, address || null];
      const { rows } = await pool.query(q, values);
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error('createClient', err);
      res.status(500).json({ error: 'DB error' });
    }
  },

  async updateClient(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

    const fields = [];
    const values = [];
    let idx = 1;
    const { name, contact_email, contact_phone, address } = req.body;
    if (name && isNonEmpty(name)) { fields.push(`name=$${idx++}`); values.push(name.trim()); }
    if (contact_email !== undefined) { fields.push(`contact_email=$${idx++}`); values.push(contact_email); }
    if (contact_phone !== undefined) { fields.push(`contact_phone=$${idx++}`); values.push(contact_phone); }
    if (address !== undefined) { fields.push(`address=$${idx++}`); values.push(address); }

    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

    const query = `UPDATE clients SET ${fields.join(', ')} WHERE id=$${idx} RETURNING id, name, contact_email, contact_phone, address, created_at`;
    values.push(id);

    try {
      const { rows } = await pool.query(query, values);
      if (!rows.length) return res.status(404).json({ error: 'Client not found' });
      res.json(rows[0]);
    } catch (err) {
      console.error('updateClient', err);
      res.status(500).json({ error: 'DB error' });
    }
  },

  async deleteClient(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    try {
      const { rowCount } = await pool.query('DELETE FROM clients WHERE id=$1', [id]);
      if (!rowCount) return res.status(404).json({ error: 'Client not found' });
      res.json({ ok: true, deletedId: id });
    } catch (err) {
      console.error('deleteClient', err);
      res.status(500).json({ error: 'DB error' });
    }
  }
};
