// server/src/server.js
require('dotenv').config();
const express = require('express');
const pool = require('./db/connection'); // ya lo tienes
const usersRoutes = require('./routes/users');
const clientsRoutes = require('./routes/clients');
const vehiclesRoutes = require('./routes/vehicles');
const ordersRoutes = require('./routes/orders');
const routesRoutes = require('./routes/routes');
const warehousesRoutes = require('./routes/warehouses');
const authRoutes = require('./routes/auth');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// rutas
app.use('/users', usersRoutes);
app.use('/clients', clientsRoutes);
app.use('/vehicles', vehiclesRoutes);
app.use('/orders', ordersRoutes);
app.use('/routes', routesRoutes);
app.use('/warehouses', warehousesRoutes);
app.use('/auth', authRoutes);

// Nueva ruta para obtener ruta entre dos puntos usando Google Directions API
app.get('/api/route', async (req, res) => {
  try {
    const { origin, destination } = req.query;
    if (!origin || !destination) {
      return res.status(400).json({ error: "Faltan parámetros: origin y destination" });
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving&departure_time=now&key=${process.env.GOOGLE_API_KEY}`;
    const response = await axios.get(url);

    if (!response.data.routes.length) {
      return res.status(404).json({ error: "No se encontró ruta" });
    }

    const leg = response.data.routes[0].legs[0];

    res.json({
      origen: leg.start_address,
      destino: leg.end_address,
      distancia: leg.distance.text,
      duracion: leg.duration.text
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => res.send('LogisticPro API'));
app.get('/db-test', async (req, res) => {
  try {
    const r = await pool.query('SELECT NOW() as now');
    res.json({ ok: true, now: r.rows[0].now });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'DB error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
