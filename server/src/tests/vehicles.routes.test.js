// 1. Importamos las herramientas
const request = require('supertest'); // Para hacer "llamadas" a nuestra app
const server = require('../../server'); // Importamos tu app de Express (ajusta si se llama app.js)
const { pool } = require('../db/connection'); // Importamos la DB para mockearla
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware'); // Importamos los middlewares para mockearlos

// --- MOCK 1: Mock de la Base de Datos ---
// Le decimos a Jest: "Cada vez que alguien importe '../db/connection'..."
jest.mock('../db/connection', () => ({
  // "...reemplázalo con este objeto falso..."
  pool: {
    // "...que tiene una función 'query' falsa (un mock)..."
    query: jest.fn(), // jest.fn() es un "espía"
  },
}));

// --- MOCK 2: Mock del Middleware de Autenticación ---
// Mockeamos el middleware para "saltarnos" la seguridad en la prueba
// Le decimos a Jest que reemplace estas funciones con funciones "tontas" que solo llaman a next()
jest.mock('../middleware/authMiddleware', () => ({
  authenticateToken: jest.fn((req, res, next) => next()), // Simula un token válido
  authorizeAdmin: jest.fn((req, res, next) => next()), // Simula un admin válido
  authorizeUser: jest.fn((req, res, next) => next()) // Simula un usuario válido
}));

// Agrupamos nuestras pruebas
describe('Pruebas de Integración para /vehicles', () => {

  // Limpiamos los mocks después de cada prueba para que no se "contaminen"
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- PRUEBA 1 (GET) ---
  describe('GET /vehicles', () => {
    it('Debe devolver 200 y una lista de vehículos para un admin', async () => {
      // 1. Preparamos el mock de la DB
      const mockVehicles = [
        { id: 1, plate: 'ABC-123', model: 'Camión' },
        { id: 2, plate: 'DEF-456', model: 'Van' },
      ];
      // Le decimos a pool.query que cuando sea llamado, devuelva nuestros vehículos falsos
      pool.query.mockResolvedValue({ rows: mockVehicles });

      // 2. Ejecutamos la prueba (la "llamada" de API)
      const response = await request(server).get('/vehicles');

      // 3. Verificamos los resultados (Matchers)
      expect(response.status).toBe(200); // ¿Respondió 200 OK?
      expect(response.body).toEqual(mockVehicles); // ¿Nos dio la lista de vehículos?
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM vehicles ORDER BY id ASC'); // ¿Llamó a la DB con el query correcto?
      expect(authorizeAdmin).toHaveBeenCalled(); // ¿Se aseguró de que fuéramos admin?
    });
  });

  // --- PRUEBA 2 (POST) ---
  describe('POST /vehicles', () => {
    it('Debe crear un vehículo nuevo y devolverlo', async () => {
      // 1. Preparamos el mock
      const newVehicleData = { plate: 'NEW-001', model: 'Moto', capacity: 150, status: 'disponible' };
      const createdVehicle = { id: 3, ...newVehicleData };
      pool.query.mockResolvedValue({ rows: [createdVehicle] }); // La DB devuelve el vehículo creado

      // 2. Ejecutamos la prueba (enviando datos)
      const response = await request(server)
        .post('/vehicles')
        .send(newVehicleData); // Enviamos el "body"

      // 3. Verificamos
      expect(response.status).toBe(200); // Tu API devuelve 200 (res.json)
      expect(response.body).toEqual(createdVehicle);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO vehicles (plate, model, capacity, status) VALUES ($1, $2, $3, $4) RETURNING *',
        ['NEW-001', 'Moto', 150, 'disponible']
      );
    });
  });

  // --- PRUEBA 3 (PUT - ÉXITO) ---
  describe('PUT /vehicles/:id', () => {
    it('Debe actualizar un vehículo y devolverlo', async () => {
      // 1. Preparamos el mock
      const updatedVehicleData = { plate: 'UPD-123', model: 'Camioneta', capacity: 2000, status: 'available' };
      const updatedVehicle = { id: 1, ...updatedVehicleData };
      pool.query.mockResolvedValue({ rows: [updatedVehicle] });

      // 2. Ejecutamos
      const response = await request(server)
        .put('/vehicles/1') // URL con el ID 1
        .send(updatedVehicleData);

      // 3. Verificamos
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedVehicle);
    });

    // --- PRUEBA 4 (PUT - FALLO 404) ---
    it('Debe devolver 404 si el vehículo a actualizar no existe', async () => {
      // 1. Preparamos el mock (la DB no devuelve nada)
      pool.query.mockResolvedValue({ rows: [] });

      // 2. Ejecutamos
      const response = await request(server)
        .put('/vehicles/999') // ID que no existe
        .send({ plate: 'NO-EXISTE' });
      
      // 3. Verificamos
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Vehículo no encontrado');
    });
  });

  // --- PRUEBA 5 (DELETE - ÉXITO) ---
  describe('DELETE /vehicles/:id', () => {
    it('Debe eliminar un vehículo y devolver 200', async () => {
      // 1. Preparamos el mock
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] }); // La DB devuelve el item borrado

      // 2. Ejecutamos
      const response = await request(server).delete('/vehicles/1');

      // 3. Verificamos
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Vehículo eliminado');
    });

    // --- PRUEBA 6 (DELETE - FALLO 404) ---
    it('Debe devolver 404 si el vehículo a eliminar no existe', async () => {
      // 1. Preparamos el mock (la DB no devuelve nada)
      pool.query.mockResolvedValue({ rows: [] });

      // 2. Ejecutamos
      const response = await request(server).delete('/vehicles/999');

      // 3. Verificamos
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Vehículo no encontrado');
    });
  });

});