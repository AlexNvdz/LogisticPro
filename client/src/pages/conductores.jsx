// client/src/pages/conductores.jsx

// const API = ...  <- Eliminado

import React, { useEffect, useState } from "react";
import "../styles/conductores.css";
import apiClient from '../lib/api';

export default function Conductores() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    identificacion: "", // Este campo no lo usamos en el backend, pero lo dejamos en el form
    telefono: "",
    licencia_conduccion: "",
  });

  useEffect(() => { fetchDrivers(); }, []);

  async function fetchDrivers() {
    setLoading(true);
    try {
      const res = await apiClient.get('/drivers');
      setDrivers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("fetchDrivers", err);
      alert("Error fetching drivers");
    } finally { setLoading(false); }
  }

  async function createDriver(e) {
    e.preventDefault();
    try {
      // El backend (que ya arreglamos) espera: nombre, telefono, licencia_conduccion
      const payload = {
        nombre: form.nombre,
        telefono: form.telefono,
        licencia_conduccion: form.licencia_conduccion
      };
      
      // Enviamos solo el payload que el backend necesita
      const res = await apiClient.post('/drivers', payload); 
      
      const created = res.data;
      setDrivers((prev) => [created, ...prev]);
      setForm({
        nombre: "",
        identificacion: "",
        telefono: "",
        licencia_conduccion: "",
      });
    } catch (err) {
      console.error("createDriver", err);
      alert("Error creating driver");
    }
  }

  return (
    <div className="conductores-page">
      <h2 className="page-title">Conductores</h2>

      <div className="conductores-grid">
        <form onSubmit={createDriver} className="conductores-form">
          <h3>Agregar conductor</h3>
          <input placeholder="Nombre" value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          <input placeholder="Identificación (Opcional)" value={form.identificacion}
            onChange={(e) => setForm({ ...form, identificacion: e.target.value })} />
          <input placeholder="Teléfono" value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <input placeholder="Licencia de conducción" value={form.licencia_conduccion}
            onChange={(e) => setForm({ ...form, licencia_conduccion: e.target.value })} />
          <button type="submit">Crear conductor</button>
        </form>

        <div className="conductores-list">
          <h3>Lista de conductores</h3>
          {loading ? (
            <div>Cargando...</div>
          ) : (
            <div className="conductores-items">
              {drivers.length === 0 && (
                <div className="empty">No hay conductores aún</div>
              )}
              {/* --- CAMBIOS AQUÍ --- */}
              {/* Usamos los nombres de la base de datos (name, id, phone, license_number) */}
              {drivers.map((d) => (
                <div key={d.id} className="conductor-card">
                  <div>
                    <strong>{d.name}</strong>
                    <div className="conductor-info">ID: {d.id}</div>
                    <div className="conductor-info">Tel: {d.phone || "N/A"}</div>
                    <div className="conductor-info">Licencia: {d.license_number || "N/A"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}