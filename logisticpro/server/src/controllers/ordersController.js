// server/src/controllers/ordersController.js
const pool = require('../db/connection');

const isNonEmpty = v => typeof v === 'string' && v.trim().length > 0;

module.exports = {
  async getAllOrders(req, res) {
    try {
      const { rows } = await pool.query(`
        SELECT o.*, c.name AS client_name, v.plate AS vehicle_plate, d.name AS driver_name
        FROM orders o
        LEFT JOIN clients c ON o.client_id = c.id
        LEFT JOIN vehicles v ON o.assigned_vehicle_id = v.id
        LEFT JOIN drivers d ON o.assigned_driver_id = d.id
        ORDER BY o.created_at DESC
      `);
      res.json(rows);
    } catch (err) {
      console.error('getAllOrders', err);
      res.status(500).json({ error: 'DB error' });
    }
  },

  async getOrderById(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

    try {
      const { rows } = await pool.query('SELECT * FROM orders WHERE id=$1', [id]);
      if (!rows.length) return res.status(404).json({ error: 'Order not found' });
      res.json(rows[0]);
    } catch (err) {
      console.error('getOrderById', err);
      res.status(500).json({ error: 'DB error' });
    }
  },

  async createOrder(req, res) {
    const { tracking_code, client_id, origin, destination, weight, assigned_vehicle_id, estimated_delivery } = req.body;
    if (!isNonEmpty(tracking_code) || !isNonEmpty(origin) || !isNonEmpty(destination)) {
      return res.status(400).json({ error: 'tracking_code, origin and destination are required' });
    }

    const clientId = client_id ? Number(client_id) : null;
    const vehicleId = assigned_vehicle_id ? Number(assigned_vehicle_id) : null;

    const clientCheckQ = clientId ? 'SELECT id FROM clients WHERE id=$1' : null;
    const vehicleCheckQ = vehicleId ? 'SELECT id FROM vehicles WHERE id=$1' : null;

    const client = clientId ? (await pool.query(clientCheckQ, [clientId])).rows[0] : true;
    if (clientId && !client) return res.status(400).json({ error: 'Client not found' });

    if (vehicleId) {
      const veh = (await pool.query(vehicleCheckQ, [vehicleId])).rows[0];
      if (!veh) return res.status(400).json({ error: 'Vehicle not found' });
    }

    // Insert order
    try {
      const q = `INSERT INTO orders (tracking_code, client_id, origin, destination, weight, status, assigned_vehicle_id, estimated_delivery)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                 RETURNING *`;
      const values = [
        tracking_code.trim(),
        clientId,
        origin.trim(),
        destination.trim(),
        weight ? Number(weight) : 0,
        'pending',
        vehicleId,
        estimated_delivery || null
      ];
      const { rows } = await pool.query(q, values);
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error('createOrder', err);
      if (err.code === '23505') return res.status(409).json({ error: 'Tracking code already exists' });
      res.status(500).json({ error: 'DB error' });
    }
  },

  async updateOrder(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

    const fields = [];
    const values = [];
    let idx = 1;
    const { tracking_code, client_id, origin, destination, weight, status, assigned_vehicle_id, assigned_driver_id, warehouse_id, estimated_delivery } = req.body;

    if (tracking_code && isNonEmpty(tracking_code)) { fields.push(`tracking_code=$${idx++}`); values.push(tracking_code.trim()); }
    if (client_id) { fields.push(`client_id=$${idx++}`); values.push(Number(client_id)); }
    if (origin) { fields.push(`origin=$${idx++}`); values.push(origin); }
    if (destination) { fields.push(`destination=$${idx++}`); values.push(destination); }
    if (weight !== undefined) { fields.push(`weight=$${idx++}`); values.push(Number(weight)); }
    if (status) { fields.push(`status=$${idx++}`); values.push(status); }
    if (assigned_vehicle_id) { fields.push(`assigned_vehicle_id=$${idx++}`); values.push(Number(assigned_vehicle_id)); }
    if (assigned_driver_id) { fields.push(`assigned_driver_id=$${idx++}`); values.push(Number(assigned_driver_id)); }
    if (warehouse_id) { fields.push(`warehouse_id=$${idx++}`); values.push(Number(warehouse_id)); }
    if (estimated_delivery) { fields.push(`estimated_delivery=$${idx++}`); values.push(estimated_delivery); }

    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

    const query = `UPDATE orders SET ${fields.join(', ')}, updated_at = now() WHERE id=$${idx} RETURNING *`;
    values.push(id);

    try {
      const { rows } = await pool.query(query, values);
      if (!rows.length) return res.status(404).json({ error: 'Order not found' });
      res.json(rows[0]);
    } catch (err) {
      console.error('updateOrder', err);
      if (err.code === '23505') return res.status(409).json({ error: 'Duplicate value' });
      res.status(500).json({ error: 'DB error' });
    }
  },

  async deleteOrder(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

    try {
      const { rowCount } = await pool.query('DELETE FROM orders WHERE id=$1', [id]);
      if (!rowCount) return res.status(404).json({ error: 'Order not found' });
      res.json({ ok: true, deletedId: id });
    } catch (err) {
      console.error('deleteOrder', err);
      res.status(500).json({ error: 'DB error' });
    }
  }
};
