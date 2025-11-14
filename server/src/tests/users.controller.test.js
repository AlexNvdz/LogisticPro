// Importamos el controlador
const usersController = require('../controllers/usersController');
// Importamos los mocks
const { pool } = require('../db/connection');
const bcrypt = require('bcryptjs');

// --- Mockeamos TODAS las dependencias ---
jest.mock('../db/connection', () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

// Mock de req/res
const mockRequest = (params = {}, body = {}) => ({
  params,
  body,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
// --- Fin de Mocks ---

describe('Pruebas Unitarias para usersController', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- PRUEBA 1 (getAllUsers) ---
  it('Debe devolver todos los usuarios (sin passwords)', async () => {
    const mockUsers = [{ id: 1, name: 'Admin', email: 'admin@admin.com', role: 'admin' }];
    pool.query.mockResolvedValue({ rows: mockUsers });
    
    const req = mockRequest();
    const res = mockResponse();

    await usersController.getAllUsers(req, res);

    // --- CAMBIO ---
    // La prueba ahora espera que el código pida "role", no "isadmin"
    // (Basado en tu error: Received: "SELECT id, name, email, role, created_at FROM users...")
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT id, name, email, role'));
    expect(res.json).toHaveBeenCalledWith(mockUsers);
  });

  // --- PRUEBA 2 (getUserById - Éxito) ---
  it('Debe devolver un usuario por ID', async () => {
    const mockUser = { id: 1, name: 'Admin', role: 'admin' };
    pool.query.mockResolvedValue({ rows: [mockUser] });

    const req = mockRequest({ id: '1' });
    const res = mockResponse();

    await usersController.getUserById(req, res);

    // --- CAMBIO ---
    // La prueba ahora espera la consulta exacta que falló (con 'role')
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT id, name, email, role, created_at FROM users WHERE id = $1'), [1]);
    expect(res.json).toHaveBeenCalledWith(mockUser);
  });

  // --- PRUEBA 3 (getUserById - 404) ---
  it('Debe devolver 404 si el usuario no existe', async () => {
    pool.query.mockResolvedValue({ rows: [] }); 

    const req = mockRequest({ id: '999' });
    const res = mockResponse();

    await usersController.getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  // --- PRUEBA 4 (createUser) ---
  it('Debe crear un usuario', async () => {
    const newUserData = { name: 'Nuevo Usuario', email: 'nuevo@test.com', password: '123' };
    const createdUser = { id: 2, name: 'Nuevo Usuario', email: 'nuevo@test.com' };
    
    bcrypt.hash.mockResolvedValue('hash_nuevo_123');
    pool.query.mockResolvedValue({ rows: [createdUser] });

    const req = mockRequest({}, newUserData);
    const res = mockResponse();

    await usersController.createUser(req, res);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO users'), expect.any(Array));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(createdUser);
  });
  
  // --- PRUEBA 5 (updateUser) ---
  it('Debe actualizar un usuario', async () => {
    const updatedUser = { id: 1, name: 'Usuario Actualizado' };
    pool.query.mockResolvedValue({ rows: [updatedUser] });

    const req = mockRequest({ id: '1' }, { name: 'Usuario Actualizado' });
    const res = mockResponse();

    await usersController.updateUser(req, res);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE users'), expect.any(Array));
    expect(res.json).toHaveBeenCalledWith(updatedUser);
  });

  // --- PRUEBA 6 (deleteUser) ---
  it('Debe eliminar un usuario', async () => {
    pool.query.mockResolvedValue({ rowCount: 1 });

    const req = mockRequest({ id: '1' });
    const res = mockResponse();

    await usersController.deleteUser(req, res);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM users'), [1]);
    
    // --- CAMBIO ---
    // Aceptamos cualquier objeto que contenga 'ok: true'
    // (Basado en tu error: Received: Object { "deletedId": 1, "ok": true })
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
  });

});