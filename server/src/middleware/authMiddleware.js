import jwt from 'jsonwebtoken';

// 1. AUNTENTICAR (Verificar el token)
// Esta función no necesita cambios. 
// Simplemente verifica el token y pasa el 'payload' (que ahora tiene 'isAdmin')
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Acceso no autorizado' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    
    // req.user ahora será algo como: { userId: 1, isAdmin: true }
    req.user = user; 
    next();
  });
};

// 2. SOLO ADMINS
export const authorizeAdmin = (req, res, next) => {
  
  // --- CAMBIO ---
  // Antes: req.user.role !== 'admin'
  // Ahora: !req.user.isAdmin (Si "isAdmin" NO es true)
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Acceso restringido a administradores' });
  }
  
  next();
};

// 3. SOLO USUARIOS REGISTRADOS
// Esta función ahora es redundante, ya que 'authenticateToken'
// hace exactamente este trabajo (verifica si el usuario está logueado).
// La dejamos "pasando" por si la usas en muchas rutas.
export const authorizeUser = (req, res, next) => {
  
  // --- CAMBIO ---
  // Si 'authenticateToken' pasó, el usuario está registrado.
  // No necesitamos revisar roles, solo llamar a next().
  if (!req.user) {
     return res.status(401).json({ message: 'Acceso restringido a usuarios registrados' });
  }
  
  next();
};