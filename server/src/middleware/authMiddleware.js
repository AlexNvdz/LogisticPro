import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Acceso no autorizado' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
};

// Solo admins
export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Acceso restringido a administradores' });
  next();
};

// Solo usuarios registrados (user o admin)
export const authorizeUser = (req, res, next) => {
  if (req.user.role !== 'user' && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Acceso restringido a usuarios registrados' });
  next();
};