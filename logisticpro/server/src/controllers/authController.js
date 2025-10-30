// server/src/controllers/authController.js
const pool = require('../db/connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';

function safeUserRow(row) {
  if (!row) return null;
  const { password_hash, ...rest } = row;
  return rest;
}

module.exports = {
  // POST /auth/register
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password are required' });

      // validar email único
      const exist = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (exist.rows.length) return res.status(409).json({ error: 'Email already registered' });

      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      const q = `INSERT INTO users (name, email, role, password_hash) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role, created_at`;
      const values = [name, email, role || 'user', password_hash];
      const { rows } = await pool.query(q, values);
      const user = rows[0];

      // generar token
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

      res.status(201).json({ token, user });
    } catch (err) {
      console.error('auth.register', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // POST /auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = rows[0];
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, user.password_hash || '');
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      // actualizar last_login
      await pool.query('UPDATE users SET last_login = now() WHERE id = $1', [user.id]);

      const safeUser = safeUserRow(user);
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

      res.json({ token, user: safeUser });
    } catch (err) {
      console.error('auth.login', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // GET /auth/me
  async me(req, res) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'Not authenticated' });
      const { rows } = await pool.query('SELECT id, name, email, role, created_at, last_login FROM users WHERE id = $1', [userId]);
      if (!rows.length) return res.status(404).json({ error: 'User not found' });
      res.json(rows[0]);
    } catch (err) {
      console.error('auth.me', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
};
