const request = require('supertest');
const app = require('../server');

describe('Pruebas de rutas generales', () => {
  test('GET /api/status debe devolver 200 y mensaje correcto', async () => {
    const res = await request(app).get('/api/status');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Servidor operativo');
  });
});
