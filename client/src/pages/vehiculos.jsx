import React, { useEffect, useState } from "react";
import "../styles/vehiculos.css";
import apiClient from '../lib/api';

// const API = ...  <- Eliminado

export default function Vehiculos() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ plate: "", model: "", capacity: "" });

  useEffect(() => { fetchVehicles(); }, []);

  async function fetchVehicles() {
    setLoading(true);
    try {
      // CAMBIO: Usamos apiClient.get y accedemos a .data
      const res = await apiClient.get('/vehicles');
      setVehicles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("fetchVehicles", err);
      alert("Error fetching vehicles");
    } finally { setLoading(false); }
  }

  async function createVehicle(e) {
    e.preventDefault();
    try {
      const payload = {
        plate: form.plate,
        model: form.model,
        capacity: Number(form.capacity || 0),
      };
      
      // CAMBIO: Usamos apiClient.post y accedemos a .data
      const res = await apiClient.post('/vehicles', payload);
      
      const created = res.data;
      setVehicles((prev) => [created, ...prev]);
      setForm({ plate: "", model: "", capacity: "" });
    } catch (err) {
      console.error("createVehicle", err);
      alert("Error creating vehicle");
    }
  }

  return (
    <div className="vehiculos-page">
      {/* ... Tu JSX (HTML) sigue exactamente igual ... */}
      {/* ... (No es necesario pegar todo el return de nuevo) ... */}
      <h2 className="page-title">Vehículos</h2>

      <div className="vehiculos-grid">
        <form onSubmit={createVehicle} className="vehiculos-form">
          <h3>Agregar vehículo</h3>
          <input placeholder="Placa" value={form.plate}
            onChange={(e) => setForm({ ...form, plate: e.target.value })} required />
          <input placeholder="Modelo" value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })} />
          <input type="number" placeholder="Capacidad" value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          <button type="submit">Crear vehículo</button>
        </form>

        <div className="vehiculos-list">
          <h3>Lista de vehículos</h3>
          {loading ? (
            <div>Cargando...</div>
          ) : (
            <div className="vehiculos-items">
                  {vehicles.length === 0 && (
                    <div className="empty">No hay vehículos aún</div>
                  )}
                  {vehicles.map((v) => (
                <div key={v.id} className="vehiculo-card">
                  <div>
                    <strong>{v.plate}</strong>{" "}
                    <span className="vehiculo-model">{v.model}</span>
                    <div className="vehiculo-info">
                      Capacidad: {v.capacity || "N/A"}
                    </div>
                  </div>
                  <span className={`status ${v.status === "available" ? "ok" : "warn"}`}>
                    {v.status || "Sin estado"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}