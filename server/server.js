// server/server.js
require('dotenv').config();
const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require("@sentry/profiling-node");
const express = require('express');
const cors = require('cors');
const pool = require('./src/db/connection');

const app = express();

// --- 2. INICIALIZAR SENTRY (Antes de cualquier middleware) ---
// Solo se activa si existe la variable SENTRY_DSN en el .env
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // Habilita el rastreo HTTP (tracing)
      new Sentry.Integrations.Http({ tracing: true }),
      // Habilita el rastreo de Express
      new Sentry.Integrations.Express({ app }),
      nodeProfilingIntegration(),
    ],
    // En producción real, baja esto a 0.1 o 0.01.
    tracesSampleRate: 1.0, 
    profilesSampleRate: 1.0,
  });

  // El manejador de peticiones 
  app.use(Sentry.Handlers.requestHandler());
  // El manejador de tracing seguido al requestHandler
  app.use(Sentry.Handlers.tracingHandler());
  
  console.log("✅ Sentry inicializado correctamente.");
} else {
  console.log("⚠️ Sentry no inicializado: Falta SENTRY_DSN en .env");
}

app.use(express.json());

app.use(
  cors({
    origin: [
      "https://logistic-pro.vercel.app", // tu frontend en producción
      "http://localhost:5173" // tu entorno local de desarrollo
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

// Ruta para PROBAR que Sentry funciona (crashea a propósito)
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("¡Error de prueba para Sentry!");
});

// --- 3. HANDLER DE ERRORES DE SENTRY (Después de todas las rutas) ---
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}


module.exports = app; // <<=== NECESARIO para los tests

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}
