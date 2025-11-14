// Importamos el controlador
const authController = require('../controllers/authController');
// Importamos los mocks
const { pool } = require('../db/connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Mockeamos TODAS las dependencias ---
jest.mock('../db/connection', () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

// Mock de req/res
const mockRequest = (body = {}) => ({ body });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
// --- Fin de Mocks ---

describe('Pruebas Unitarias para authController', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- PRUEBA 1 (Register - Éxito) ---
  describe('POST /register', () => {
    it('Debe registrar un usuario nuevo', async () => {
      const req = mockRequest({ name: 'Test User', email: 'test@test.com', password: '123' });
      const res = mockResponse();

      // Mock 1: Email no existe
      pool.query.mockResolvedValueOnce({ rows: [] }); 
      // Mock 2: bcrypt hashea el password
      bcrypt.hash.mockResolvedValue('hashedpassword123');
      // Mock 3: La DB inserta el usuario
      const mockUser = { id: 1, name: 'Test User', email: 'test@test.com', isadmin: false };
      pool.query.mockResolvedValueOnce({ rows: [mockUser] });
      // Mock 4: JWT firma el token
      jwt.sign.mockReturnValue('fake-token-for-register');

      await authController.register(req, res);

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT id FROM users'), ['test@test.com']);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO users'), ['Test User', 'test@test.com', false, 'hashedpassword123']);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        token: 'fake-token-for-register',
        user: mockUser,
      });
    });
    
    // --- PRUEBA 2 (Register - Falla por email duplicado) ---
    it('Debe devolver 409 si el email ya existe', async () => {
      const req = mockRequest({ name: 'Test User', email: 'test@test.com', password: '123' });
      const res = mockResponse();
      
      // Mock 1: Email SÍ existe
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); 
      
      await authController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email already registered' });
    });
  });

  // --- PRUEBA 3 (Login - Éxito) ---
  describe('POST /login', () => {
    it('Debe loguear un usuario existente', async () => {
      const req = mockRequest({ email: 'admin@test.com', password: '123' });
      const res = mockResponse();
      const mockUser = { id: 1, email: 'admin@test.com', password_hash: 'hashedadminpass', isadmin: true };

      // Mock 1: Encuentra al usuario
      pool.query.mockResolvedValueOnce({ rows: [mockUser] });
      // Mock 2: bcrypt.compare dice que la clave es correcta
      bcrypt.compare.mockResolvedValue(true);
      // Mock 3: UPDATE last_login (no devuelve nada)
      pool.query.mockResolvedValueOnce({ rows: [] });
      // Mock 4: JWT firma el token
      jwt.sign.mockReturnValue('fake-admin-token');

      await authController.login(req, res);
      
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM users'), ['admin@test.com']);
      expect(bcrypt.compare).toHaveBeenCalledWith('123', 'hashedadminpass');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE users SET last_login'), [1]);
      expect(res.json).toHaveBeenCalledWith({
        token: 'fake-admin-token',
        user: { id: 1, email: 'admin@test.com', isadmin: true } // safeUserRow quita el hash
      });
    });
    
    // --- PRUEBA 4 (Login - Falla por clave incorrecta) ---
    it('Debe devolver 401 si la clave es incorrecta', async () => {
      const req = mockRequest({ email: 'admin@test.com', password: 'clave-mala' });
      const res = mockResponse();
      const mockUser = { id: 1, email: 'admin@test.com', password_hash: 'hashedadminpass' };

      // Mock 1: Encuentra al usuario
      pool.query.mockResolvedValueOnce({ rows: [mockUser] });
      // Mock 2: bcrypt.compare dice que la clave es INCORRECTA
      bcrypt.compare.mockResolvedValue(false);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });
  });
  
  // --- PRUEBA 5 (GET /me - Éxito) ---
  describe('GET /me', () => {
    it('Debe devolver los datos del usuario logueado', async () => {
      const req = { userId: 1 }; // Esto lo pone el middleware
      const res = mockResponse();
      const mockUser = { id: 1, name: 'Test User', email: 'test@test.com', isadmin: false };
      
      pool.query.mockResolvedValue({ rows: [mockUser] });

      await authController.me(req, res);

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT id, name, email, isadmin'), [1]);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
    
    // --- PRUEBA 6 (GET /me - Falla 404) ---
    it('Debe devolver 404 si el usuario del token no existe', async () => {
      const req = { userId: 999 }; 
      const res = mockResponse();
      
      // Mock 1: No encuentra al usuario
      pool.query.mockResolvedValue({ rows: [] }); 

      await authController.me(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

});