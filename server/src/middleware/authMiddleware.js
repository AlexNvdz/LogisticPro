// server/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

module.exports = (req, res, next) => {
  try {
    // token en Authorization: Bearer <token>
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'No token' });

    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid auth format' });

    const token = parts[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    console.error('authMiddleware', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
