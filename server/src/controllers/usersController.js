// server/src/controllers/usersController.js
const pool = require('../db/connection');

// Helpers de validación simples
function isValidEmail(email) {
  return typeof email === 'string' && /\S+@\S+\.\S+/.test(email);
}
function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

module.exports = {
  // GET /users
  async getAllUsers(req, res) {
    try {
      const { rows } = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY id');
      res.json(rows);
    } catch (err) {
      console.error('getAllUsers error', err);
      res.status(500).json({ error: 'Database error' });
    }
  },

  // GET /users/:id
  async getUserById(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    try {
      const { rows } = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json(rows[0]);
    } catch (err) {
      console.error('getUserById error', err);
      res.status(500).json({ error: 'Database error' });
    }
  },

  // POST /users
  async createUser(req, res) {
    const { name, email, role } = req.body;
    if (!isNonEmptyString(name)) return res.status(400).json({ error: 'name is required' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'valid email is required' });

    try {
      const q = `INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at`;
      const values = [name.trim(), email.trim().toLowerCase(), role && isNonEmptyString(role) ? role.trim() : 'user'];
      const { rows } = await pool.query(q, values);
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error('createUser error', err);
      // Manejo simple de duplicado por constraint unique(email)
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: 'Database error' });
    }
  },

  // PUT /users/:id
  async updateUser(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const { name, email, role } = req.body;
    if (email && !isValidEmail(email)) return res.status(400).json({ error: 'invalid email' });

    // construir dinámicamente la query
    const fields = [];
    const values = [];
    let idx = 1;
    if (name && isNonEmptyString(name)) { fields.push(`name = $${idx++}`); values.push(name.trim()); }
    if (email) { fields.push(`email = $${idx++}`); values.push(email.trim().toLowerCase()); }
    if (role && isNonEmptyString(role)) { fields.push(`role = $${idx++}`); values.push(role.trim()); }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, role, created_at`;
    values.push(id);

    try {
      const { rows } = await pool.query(query, values);
      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json(rows[0]);
    } catch (err) {
      console.error('updateUser error', err);
      if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
      res.status(500).json({ error: 'Database error' });
    }
  },

  // DELETE /users/:id
  async deleteUser(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    try {
      const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
      if (rowCount === 0) return res.status(404).json({ error: 'User not found' });
      res.json({ ok: true, deletedId: id });
    } catch (err) {
      console.error('deleteUser error', err);
      res.status(500).json({ error: 'Database error' });
    }
  }
};
