// server/tests/db.test.js
const pool = require('../src/db/connection');

describe('Conexión real a PostgreSQL (Render)', () => {
  test('Debe conectarse y devolver la hora actual', async () => {
    const result = await pool.query('SELECT NOW()');
    expect(result.rows.length).toBeGreaterThan(0);
  });

  afterAll(async () => {
    await pool.end(); // cerrar conexión
  });
});
