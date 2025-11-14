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

// --- Pruebas para /drivers ---
describe('Pruebas de Integración para /drivers', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- PRUEBA 1 (GET) ---
  describe('GET /drivers', () => {
    it('Debe devolver 200 y una lista de conductores', async () => {
      const mockDrivers = [
        { id: 1, name: 'Conductor 1', license_number: 'L123' },
        { id: 2, name: 'Conductor 2', license_number: 'L456' },
      ];
      pool.query.mockResolvedValue({ rows: mockDrivers });

      const response = await request(server).get('/drivers');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDrivers);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM drivers ORDER BY id ASC');
    });
  });

  // --- PRUEBA 2 (POST) ---
  describe('POST /drivers', () => {
    it('Debe crear un conductor nuevo', async () => {
      const newDriverData = { name: 'Nuevo Conductor', phone: '555-1234', license_number: 'L-NEW' };
      const createdDriver = { id: 3, ...newDriverData };
      pool.query.mockResolvedValue({ rows: [createdDriver] });

      const response = await request(server)
        .post('/drivers')
        .send(newDriverData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(createdDriver);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO drivers (name, license_number, phone) VALUES ($1, $2, $3) RETURNING *',
        ['Nuevo Conductor', 'L-NEW', '555-1234']
      );
    });
  });

  // --- PRUEBA 3 (PUT - ÉXITO) ---
  describe('PUT /drivers/:id', () => {
    it('Debe actualizar un conductor', async () => {
      const updatedDriver = { id: 1, name: 'Conductor Editado', phone: '111', license_number: 'L-EDIT' };
      pool.query.mockResolvedValue({ rows: [updatedDriver] });

      const response = await request(server)
        .put('/drivers/1')
        .send({ name: 'Conductor Editado', phone: '111', license_number: 'L-EDIT' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedDriver);
    });

    // --- PRUEBA 4 (PUT - FALLO 404) ---
    it('Debe devolver 404 si el conductor a actualizar no existe', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const response = await request(server)
        .put('/drivers/999')
        .send({ name: 'NO-EXISTE' });
      expect(response.status).toBe(404);
    });
  });

  // --- PRUEBA 5 (DELETE - ÉXITO) ---
  describe('DELETE /drivers/:id', () => {
    it('Debe eliminar un conductor', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] }); 
      const response = await request(server).delete('/drivers/1');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Conductor eliminado');
    });

    // --- PRUEBA 6 (DELETE - FALLO 404) ---
    it('Debe devolver 404 si el conductor a eliminar no existe', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const response = await request(server).delete('/drivers/999');
      expect(response.status).toBe(404);
    });
  });

});