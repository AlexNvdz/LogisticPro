/*
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
*/

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/layout";
import Dashboard from "./pages/dashboard";
import Envios from "./pages/envios";
import Rutas from "./pages/rutas";
import Conductores from "./pages/conductores";
import Almacenes from "./pages/almacenes";
import Usuarios from "./pages/usuarios";
import Vehiculos from "./pages/vehiculos";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/login";
import Register from "./pages/register";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔓 Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔒 Rutas privadas */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route
            path="envios"
            element={<PrivateRoute allowedRoles={["admin", "user"]}><Envios /></PrivateRoute>}
          />
          <Route
            path="rutas"
            element={<PrivateRoute allowedRoles={["admin", "user"]}><Rutas /></PrivateRoute>}
          />
          <Route
            path="almacenes"
            element={<PrivateRoute allowedRoles={["admin"]}><Almacenes /></PrivateRoute>}
          />
          <Route
            path="conductores"
            element={<PrivateRoute allowedRoles={["admin"]}><Conductores /></PrivateRoute>}
          />
          <Route
            path="vehiculos"
            element={<PrivateRoute allowedRoles={["admin"]}><Vehiculos /></PrivateRoute>}
          />
          <Route
            path="usuarios"
            element={<PrivateRoute allowedRoles={["admin"]}><Usuarios /></PrivateRoute>}
          />
        </Route>

        {/* 🚫 Ruta no encontrada */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
