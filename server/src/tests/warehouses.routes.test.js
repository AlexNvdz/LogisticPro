const request = require('supertest');
const server = require('../../server'); // Importamos tu app
const { pool } = require('../db/connection'); // Importamos la DB para mockearla
const { authenticateToken, authorizeAdmin, authorizeUser } = require('../middleware/authMiddleware'); // Importamos los middlewares

// --- Mockeamos la DB ---
jest.mock('../db/connection', () => ({
  pool: {
    query: jest.fn(),
  },
}));

// --- Mockeamos los Middlewares ---
jest.mock('../middleware/authMiddleware', () => ({
  authenticateToken: jest.fn((req, res, next) => next()),
  authorizeAdmin: jest.fn((req, res, next) => next()),
  authorizeUser: jest.fn((req, res, next) => next()),
}));

// --- Pruebas para /warehouses ---
describe('Pruebas de Integración para /warehouses', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- PRUEBA 1 (GET) ---
  describe('GET /warehouses', () => {
    it('Debe devolver 200 y una lista de almacenes', async () => {
      const mockWarehouses = [
        { id: 1, name: 'Almacén Central', location: 'Bogotá' },
        { id: 2, name: 'Almacén Norte', location: 'Medellín' },
      ];
      pool.query.mockResolvedValue({ rows: mockWarehouses });

      const response = await request(server).get('/warehouses');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockWarehouses);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM warehouses ORDER BY id DESC');
    });
  });

  // --- PRUEBA 2 (POST) ---
  describe('POST /warehouses', () => {
    it('Debe crear un almacén nuevo', async () => {
      const newWarehouseData = { name: 'Almacén Nuevo', location: 'Cali', capacity: 100, manager: 'Ana' };
      const createdWarehouse = { id: 3, ...newWarehouseData, status: 'activo' };
      pool.query.mockResolvedValue({ rows: [createdWarehouse] });

      const response = await request(server)
        .post('/warehouses')
        .send(newWarehouseData);

      expect(response.status).toBe(200); // Tu API devuelve 200 (res.json)
      expect(response.body).toEqual(createdWarehouse);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO warehouses'), // Comprueba que es un INSERT
        ['Almacén Nuevo', 'Cali', 100, 'Ana', 'activo'] // Comprueba los valores
      );
    });
  });

  // --- PRUEBA 3 (PUT - ÉXITO) ---
  describe('PUT /warehouses/:id', () => {
    it('Debe actualizar un almacén', async () => {
      const updatedWarehouse = { id: 1, name: 'Almacén Editado' };
      pool.query.mockResolvedValue({ rows: [updatedWarehouse] });

      const response = await request(server)
        .put('/warehouses/1')
        .send({ name: 'Almacén Editado', location: 'Bogotá', capacity: 100, manager: 'Ana', status: 'activo' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedWarehouse);
    });

    // --- PRUEBA 4 (PUT - FALLO 404) ---
    it('Debe devolver 404 si el almacén a actualizar no existe', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const response = await request(server)
        .put('/warehouses/999')
        .send({ name: 'NO-EXISTE' });
      expect(response.status).toBe(404);
    });
  });

  // --- PRUEBA 5 (DELETE - ÉXITO) ---
  describe('DELETE /warehouses/:id', () => {
    it('Debe eliminar un almacén', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] }); 
      const response = await request(server).delete('/warehouses/1');
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });

    // --- PRUEBA 6 (DELETE - FALLO 404) ---
    it('Debe devolver 404 si el almacén a eliminar no existe', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const response = await request(server).delete('/warehouses/999');
      expect(response.status).toBe(404);
    });
  });

});