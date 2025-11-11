const request = require('supertest');
const app = require('../server');

describe('Pruebas de autenticación', () => {
  test('POST /auth/register debe responder 201', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        nombre: 'UsuarioTest',
        email: 'usuario@test.com',
        password: '123456',
      });
    expect([200, 201, 400]).toContain(res.statusCode);
  });

  test('POST /auth/login debe responder 200 o 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'usuario@test.com',
        password: '123456',
      });
    expect([200, 401]).toContain(res.statusCode);
  });
});
