// server/server.js
require('dotenv').config();
const express = require('express');
const pool = require('./src/db/connection');

const app = express();
app.use(express.json());

const usersRoutes = require('./src/routes/users');
const clientsRoutes = require('./src/routes/clients');
const vehiclesRoutes = require('./src/routes/vehicles');
const driversRoutes = require('./src/routes/drivers');
const ordersRoutes = require('./src/routes/orders');
const warehousesRoutes = require('./src/routes/warehouses');
const authRoutes = require('./src/routes/auth');

app.get('/api/status', (req, res) => {
  res.status(200).json({ message: 'Servidor operativo' });
});

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/clients', clientsRoutes);
app.use('/vehicles', vehiclesRoutes);
app.use('/drivers', driversRoutes);
app.use('/orders', ordersRoutes);
app.use('/warehouses', warehousesRoutes);

app.get('/db-test', async (req, res) => {
  try {
    const r = await pool.query('SELECT NOW() as now');
    res.json({ ok: true, now: r.rows[0].now });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'DB error' });
  }
});

module.exports = app; // <<=== NECESARIO para los tests

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}
