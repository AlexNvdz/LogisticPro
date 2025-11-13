import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/layout";
import Dashboard from "./pages/dashboard";
import Envios from "./pages/envios";
import Rutas from "./pages/rutas";
import Conductores from "./pages/conductores";
import Almacenes from "./pages/almacenes";
import Clientes from "./pages/clientes";
import Vehiculos from "./pages/vehiculos";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/login";
import Register from "./pages/register";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas privadas con Layout */}
        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="envios" element={<Envios />} />
          <Route path="rutas" element={<Rutas />} />
          <Route path="almacenes" element={<Almacenes />} />
          <Route path="conductores" element={<Conductores />} />
          <Route path="vehiculos" element={<Vehiculos />} />
          <Route path="clientes" element={<Clientes />} />
        </Route>

        {/* Ruta no encontrada */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;