# 🚚 LogisticPro

### Sistema de Gestión Logística Inteligente

---

## 🧭 **Descripción General**

**LogisticPro** es una aplicación web enfocada en la **gestión y optimización de operaciones logísticas**, permitiendo a las empresas controlar sus envíos, rutas, almacenes y personal desde un panel centralizado.

El proyecto busca automatizar procesos clave del flujo logístico mediante una **arquitectura cliente-servidor**:
- **Frontend** desarrollado con **Vite + React**, proporcionando una interfaz moderna e intuitiva.
- **Backend** basado en **Node.js + Express**, encargado de la lógica y conexión con la base de datos.
- **Base de datos** implementada con **PostgreSQL**, gestionando toda la información de usuarios, envíos, rutas y almacenes.

---

## 🎯 **Objetivos del Proyecto**

1. Crear un sistema capaz de **gestionar envíos, rutas, almacenes y usuarios** en un solo entorno.  
2. Diseñar un **frontend profesional y responsivo**, adaptable a escritorio y móvil.  
3. Implementar una **API RESTful** que comunique el servidor con el cliente de forma eficiente.  
4. Utilizar una base de datos **PostgreSQL** para almacenar la información del sistema.  
5. Integrar principios de **DevOps**:
   - Automatización de despliegue con Vercel.
   - Integración continua (CI/CD) mediante GitHub Actions.
6. Aplicar buenas prácticas de código con herramientas como **ESLint** y **Prettier** (opcional).

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
│   │   └── index.js       # Servidor principal
│   ├── .env               # Variables de entorno
│   └── package.json
│
├── .github/workflows/     # CI/CD con GitHub Actions
│
└── README.md              # Documentación del proyecto
```

---

## 🧠 **Módulos Principales**

| Módulo | Función | Características |
|--------|----------|----------------|
| **Dashboard** | Visión general del sistema | KPIs, métricas, accesos rápidos |
| **Envíos** | Gestión de pedidos | CRUD de envíos: cliente, destino, estado, fecha |
| **Rutas** | Planificación de rutas | Cálculo y optimización (futuro) |
| **Almacenes** | Control de bodegas | Registro y capacidad de almacenes |
| **Usuarios** | Administración | Roles, permisos y autenticación (futuro) |

---

## ⚙️ **Tecnologías Utilizadas**

### **Frontend**
- ⚛️ React + Vite  
- 🎨 CSS base (sin frameworks)
- 🌐 React Router DOM (navegación)

### **Backend**
- 🟢 Node.js + Express  
- 🧩 PostgreSQL (Base de datos)
- 🔐 dotenv (variables de entorno)
- ⚙️ nodemon (modo desarrollo)

### **DevOps**
- 🚀 Vercel (despliegue frontend)
- 🤖 GitHub Actions (CI/CD)
- 🧹 ESLint / Prettier (estilo de código opcional)

---

## 🧰 **Requisitos Previos**

- Node.js 18+
- PostgreSQL 14 o superior
- Navegador moderno

---

## 🪄 **Instalación del Proyecto**

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/AlexNvdz/LogisticPro.git
cd LogisticPro
```

### 2️⃣ Instalar dependencias
```bash
cd client
npm install
cd ../server
npm install
```

### 3️⃣ Configurar base de datos PostgreSQL
En `server/.env`:
```
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASS=tu_contraseña
DB_NAME=logisticpro
DB_PORT=5432
PORT=3000
```

### 4️⃣ Ejecutar entorno de desarrollo
Frontend:
```bash
cd client
npm run dev
```

Backend:
```bash
cd server
npm run start
```

---

## 🚧 **Fases del Proyecto (DevOps Guide)**

| Semana | Fase | Descripción | Estado |
|--------|------|-------------|--------|
| 1 | Planificación y setup | Estructura inicial | ✅ |
| 2 | Build y testing | Configuración del entorno | ✅ |
| 3 | CI/CD | Integración continua | 🔄 |
| 4 | Despliegue automático | Vercel + variables | 🔄 |
| 5 | Monitoreo y mejora continua | PM2, métricas | ⏸️ |

---

## 🧾 **Estado Actual**

- [x] Estructura inicial React + Express  
- [x] Diseño del panel administrativo  
- [ ] Conexión a PostgreSQL  
- [ ] API REST (CRUD)  
- [ ] CI/CD  
- [ ] Despliegue final

---

## 👥 **Autores**
- **Alex Navarro** 
  GitHub: [@AlexNvdz](https://github.com/AlexNvdz)
