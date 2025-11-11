import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const isRender = !!process.env.DATABASE_URL;

const pool = new Pool(
  isRender
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : {
        host: process.env.PGHOST || 'localhost',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '1234',
        database: process.env.PGDATABASE || 'logisticpro',
        port: process.env.PGPORT || 5432
      }
);

pool.connect()
  .then(() => console.log("✅ Conectado correctamente a la base de datos"))
  .catch(err => console.error("❌ Error al conectar a la base de datos:", err.message));

export { pool };
