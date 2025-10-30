-- server/src/db/schema.sql
-- Versión corregida

-- ============================
-- Users
-- ============================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================
-- Clients
-- ============================
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  contact_email VARCHAR(200),
  contact_phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_contact_email ON clients(contact_email);

-- ============================
-- Vehicles
-- ============================
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  plate VARCHAR(50) NOT NULL UNIQUE,
  model VARCHAR(200),
  capacity REAL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate);

-- ============================
-- Drivers
-- ============================
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  license_number VARCHAR(100),
  phone VARCHAR(50),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de almacenes (warehouses)
CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200) NOT NULL,
  capacity INTEGER DEFAULT 0,
  manager VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de rutas (routes)
CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  origin VARCHAR(200) NOT NULL,
  destination VARCHAR(200) NOT NULL,
  distance_km NUMERIC(10,2),
  estimated_time VARCHAR(50),
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================
-- Items
-- ============================
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(100) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  weight REAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================
-- Shipments (detalle histórico / objeto de envío)
-- ============================
CREATE TABLE IF NOT EXISTS shipments (
  id SERIAL PRIMARY KEY,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  weight REAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ahora añadimos columnas relacionales en shipments (las tablas referenciadas ya existen)
ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS route_id INTEGER REFERENCES routes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);

-- ============================
-- Orders (pedidos con tracking; puede solaparse con shipments según diseño)
-- ============================
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  tracking_code VARCHAR(100) UNIQUE NOT NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  weight REAL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  assigned_vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  assigned_driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE SET NULL,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aseguramos índice único (evita fallo si duplicados existen)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_orders_tracking'
  ) THEN
    BEGIN
      CREATE UNIQUE INDEX idx_orders_tracking ON orders(tracking_code);
    EXCEPTION WHEN unique_violation THEN
      RAISE NOTICE 'No se pudo crear idx_orders_tracking por duplicados existentes';
    END;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ============================
-- Relación shipments <-> items (detalle)
-- ============================
CREATE TABLE IF NOT EXISTS shipment_items (
  id SERIAL PRIMARY KEY,
  shipment_id INTEGER REFERENCES shipments(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES items(id) ON DELETE RESTRICT,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (shipment_id, item_id)
);

-- ============================
-- Warehouse inventory
-- ============================
CREATE TABLE IF NOT EXISTS warehouse_inventory (
  id SERIAL PRIMARY KEY,
  warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES items(id) ON DELETE RESTRICT,
  quantity INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (warehouse_id, item_id)
);

-- ============================
-- Índices extra
-- ============================
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Añadir columnas faltantes para warehouses (idempotente)

ALTER TABLE warehouses
  ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE warehouses
  ADD COLUMN IF NOT EXISTS location VARCHAR(200),
  ADD COLUMN IF NOT EXISTS manager VARCHAR(200),
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'activo';

UPDATE warehouses
  SET location = address
  WHERE (location IS NULL OR location = '') AND address IS NOT NULL;