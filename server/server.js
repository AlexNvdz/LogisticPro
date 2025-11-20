// server/server.js
require('dotenv').config();
const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require("@sentry/profiling-node");
const express = require('express');
const cors = require('cors');
const pool = require('./src/db/connection');

const app = express();

// --- 2. INICIALIZAR SENTRY (Antes de cualquier middleware) ---
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      Sentry.httpIntegration(),
      // En v8, esta línea se encarga del requestHandler y tracingHandler automáticamente
      Sentry.expressIntegration({ app }), 
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0, 
    profilesSampleRate: 1.0,
  });
  
  console.log("✅ Sentry inicializado correctamente.");
  
} else {
  console.log("⚠️ Sentry no inicializado: Falta SENTRY_DSN en .env");
}

app.use(express.json());

app.use(
  cors({
    origin: [
      "https://logistic-pro.vercel.app", 
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  })
);

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

// Ruta para PROBAR que Sentry funciona
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("¡Error de prueba para Sentry!");
});

// --- 3. HANDLER DE ERRORES DE SENTRY ---
// En v8 se usa setupExpressErrorHandler
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

module.exports = app; 

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}