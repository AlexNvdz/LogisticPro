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
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔐 Ruta pública de login */}
        <Route path="/login" element={<Login />} />

        {/* 🔒 Rutas privadas dentro del Layout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/envios"
          element={
            <PrivateRoute allowedRoles={["admin", "user"]}>
              <Layout>
                <Envios />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/rutas"
          element={
            <PrivateRoute allowedRoles={["admin", "user"]}>
              <Layout>
                <Rutas />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* 🏢 Solo admin */}
        <Route
          path="/almacenes"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout>
                <Almacenes />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/conductores"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout>
                <Conductores />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/vehiculos"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout>
                <Vehiculos />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout>
                <Usuarios />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* 🚫 Ruta no encontrada */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
