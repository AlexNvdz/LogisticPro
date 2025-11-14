# 🚚 LogisticPro

### Sistema de Gestión Logística Inteligente

---

## 🧭 **Descripción General**

**LogisticPro** es una aplicación web para la **gestión y optimización de operaciones logísticas**, permitiendo controlar envíos, rutas, almacenes y usuarios desde un panel centralizado.

Arquitectura principal:
- **Frontend**: Vite + React
- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL

---

## 🎯 **Objetivos del Proyecto**

1. Gestionar envíos, rutas, almacenes y usuarios.  
2. Proveer un frontend responsivo y profesional.  
3. Ofrecer una API RESTful eficiente.  
4. Persistir datos en PostgreSQL.  
5. Integrar CI/CD y despliegue automático.  

---

## 🧩 **Arquitectura del Proyecto**

```
LogisticPro/
│
├── client/                # Frontend (Vite + React)
│   ├── src/
│   │   ├── layout/        # Estructura visual (sidebar, header)
│   │   ├── pages/         # Módulos principales del sistema
│   │   └── App.jsx        # Definición de rutas
│   ├── index.html
│   └── package.json
│
├── server/                # Backend (Node + Express)
│   ├── src/
│   │   ├── db/            # Conexión a PostgreSQL
│   │   ├── routes/        # Endpoints REST
│   │   ├── controllers/   # Lógica de negocio
│   │   └── server.js      # Servidor principal (nota: `server.js`)
│   ├── .env.test          # Variables de entorno para tests
│   └── package.json
│
├── .github/workflows/     # CI/CD con GitHub Actions
│
└── README.md              # Documentación del proyecto
```

---

## 🧠 **Módulos Principales**

- **Dashboard**: KPIs y métricas.
- **Envíos**: CRUD de envíos (cliente, destino, estado).
- **Rutas**: Planificación y optimización (en desarrollo).
- **Almacenes**: Registro y capacidad.
- **Usuarios**: Roles, permisos y autenticación.

---

## ⚙️ **Tecnologías Utilizadas**

- Frontend: React + Vite, React Router DOM
- Backend: Node.js + Express, dotenv, pg
- DevOps: Vercel (frontend), GitHub Actions (CI)

---

## 🗂️ Estructura y responsabilidades del backend (`server/`)

Esta sección describe, de forma ordenada, las carpetas y archivos principales dentro de `server/` y su propósito.

- `server/` (raíz): código del backend (Node + Express), scripts y tests.
	- `.env.test`: variables de entorno usadas en pruebas/CI. No subir credenciales reales.
	- `dockerfile`: instrucciones para construir la imagen Docker del servidor (revisar `RUN npm run build` si no hay script `build`).
	- `package.json`: scripts (`start`, `dev`, `test`) y dependencias del servidor.
	- `server.js`: punto de entrada de la aplicación; configura Express, middlewares globales y monta las rutas (ej. `/api/*`).

- `__tests__/`: pruebas automatizadas (Jest + Supertest). Archivos presentes verifican autenticación, conexión a BD y rutas básicas.

- `src/`: código fuente principal, organizado por capas.
	- `src/controllers/`: lógica por recurso (controladores). Ejemplos:
		- `authController.js`: registro, login, `me` (genera y valida JWT, hash de contraseñas).
		- `clientsController.js`: CRUD de clientes (listar, crear, actualizar, eliminar).
		- `ordersController.js`: CRUD de envíos; incluye joins para mostrar cliente, vehículo y conductor.
		- `routeController.js`: crear/listar rutas planificadas.
		- `geocodeController.js`: consulta al API de Google Geocoding para obtener direcciones desde coordenadas.
		- `usersController.js`, `vehiclesController.js`: lógica para usuarios y vehículos (si están presentes).

	- `src/db/`:
		- `connection.js`: exporta el `pool` de PostgreSQL (`pg`) usado por los controladores.
		- `setup.js`: utilidades/seed o creación de esquemas (si existen).

	- `src/middleware/`:
		- `authMiddleware.js`: middlewares de seguridad:
			- `authenticateToken`: valida JWT y añade `userId`/`isadmin` a la request.
			- `authorizeUser` / `authorizeAdmin`: controlan acceso según permisos/roles.

	- `src/routes/`: definición de rutas por recurso. Cada archivo exporta un `router`:
		- `auth.js`: `POST /register`, `POST /login`, `GET /me`.
		- `clients.js`: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.
		- `drivers.js`: endpoints para conductores (list/create/update/delete).
		- `orders.js`: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` (visibilidad y permisos diferenciados).
		- `routes.js`: gestión de rutas y endpoint `/geocode`.
		- `users.js`, `vehicles.js`, `warehouses.js`: CRUD relacionados.

	- `src/scripts/`:
		- `seedUser.js`: script para insertar usuarios de prueba (ejecutar manualmente: `node src/scripts/seedUser.js`).

Resumen funcional:
- La arquitectura sigue el patrón rutas → controladores → acceso a BD.
- Autenticación por JWT con campo `isadmin` en el token para autorización.
- Recursos implementados (al menos): clientes, conductores, vehículos, envíos, rutas y almacenes.
- Integración con Google Geocoding para geolocalización inversa.
- Tests automatizados bajo `__tests__/`.

## 🗂️ Estructura y responsabilidades del frontend (`client/`)

Esta sección describe la organización de la carpeta `client/` y el propósito de sus archivos y subcarpetas.

- `client/` (raíz): aplicación frontend creada con Vite + React. Contiene configuración, código fuente, tests y assets.
	- `package.json`: scripts útiles (`dev`, `build`, `preview`, `lint`) y dependencias (React, React Router, @react-google-maps/api, recharts, axios, etc.).
	- `vite.config.js`: configuración del bundler Vite.
	- `index.html`: HTML base donde se monta la app React.
	- `README.md`: documentación específica del cliente (si existe).

- `public/`: archivos estáticos que se sirven tal cual (favicon, imágenes públicas, etc.).

- `src/`: código fuente principal.
	- `src/main.jsx`: punto de entrada de React (renderiza `<App />`).
	- `src/App.jsx`: componente raíz donde se definen rutas globales y providers (p. ej. context).
	- `src/index.css`, `src/App.css`: estilos globales.

	- `src/components/`: componentes reutilizables de UI.
		- `PrivateRoute.jsx`: componente para proteger rutas que requieren autenticación.
		- Otros componentes compartidos (botones, inputs, modales) pueden estar aquí.

	- `src/layout/`: componentes de layout (barra lateral, header) y estilos (`layout.css`).

	- `src/lib/`: utilidades y wrappers para consumo de API y autenticación:
		- `api.js`: configuración de axios / funciones para llamar al backend.
		- `auth.js`: helpers para manejar token, login/logout, estado de sesión.

	- `src/pages/`: páginas principales de la aplicación (cada una corresponde a una ruta):
		- `dashboard.jsx`, `envios.jsx`, `clientes.jsx`, `conductores.jsx`, `vehiculos.jsx`, `almacenes.jsx`, `rutas.jsx`, `login.jsx`, `register.jsx`.

	- `src/assets/`: imágenes, iconos y otros recursos estáticos usados por los componentes.

	- `src/styles/`: hojas de estilo por página (`dashboard.css`, `envios.css`, `clientes.css`, etc.).

	- `src/setupTests.ts`: configuración para testing (Jest/React Testing Library) si aplica.

- `__tests__/`: pruebas unitarias/funcionales del cliente. En este proyecto hay tests como `APIStatus.test.tsx`, `AppRender.test.tsx`, `DashboardFlow.test.tsx`.

Resumen funcional del frontend:
- App construida con React y Vite, usa `react-router-dom` para navegación y componentes protegidos (`PrivateRoute`).
- Consume la API backend a través de `src/lib/api.js` (axios) y maneja autenticación con `src/lib/auth.js` (token en localStorage o similar).
- Integra `@react-google-maps/api` para mapas/geocodificación y `recharts` para gráficos en el dashboard.
- Estilos organizados por página en `src/styles/` y layout compartido en `src/layout/`.

Cómo ejecutar la app frontend (rápido):

```powershell
cd client
npm install
npm run dev
```

Build y preview:

```powershell
cd client
npm run build
npm run preview
```

Tests (si no existe script `test` en `client/package.json`):

```powershell
cd client
npx vitest
```

## 🧰 **Requisitos Previos**

- Node.js 18+
- PostgreSQL 14+
- Navegador moderno

---

## 🪄 **Instalación Rápida**

1) Clonar:

```powershell
git clone https://github.com/AlexNvdz/LogisticPro.git
cd LogisticPro
```

2) Instalar dependencias:

```powershell
cd client
npm install
cd ../server
npm install
```

---

## ✅ **Correcciones y Notas Importantes**

- **Servidor principal**: el archivo principal del backend es `server/server.js` (no `index.js`).
- **Env samples**: el repo incluye `server/.env.test` (uso en tests/CI); sería recomendable añadir `server/.env.example` para desarrollo.
- **Dockerfile (nota)**: `server/dockerfile` ejecuta `RUN npm run build` pero `server/package.json` no define `build`. Esto puede provocar fallos al construir la imagen; revisar el Dockerfile o añadir un script `build` si aplica.

---

## 🧪 **Cómo ejecutar tests**

- Backend (Jest):

```powershell
cd server
npm run test:corevage
```

- Frontend (Vitest) — si no existe el script `test` en `client/package.json`, usar `npx` directamente:

```powershell
cd client
npm run corevage
```

---

## 🧾 **Seed / Datos de ejemplo**

Para crear un usuario de pruebas (seed) desde el backend:

```powershell
cd server
node src/scripts/seedUser.js
```

Asegúrate de tener las variables de entorno (`.env`) apuntando a una base de datos válida antes de ejecutar el seed.

---

## 🐳 **Docker**

Construcción y ejecución local (ejemplo):

```powershell
cd server
docker build -t logisticpro-server -f dockerfile .
docker run -e DB_HOST=... -e DB_USER=... -p 3000:3000 logisticpro-server
```
