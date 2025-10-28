import React, { useEffect, useState } from "react";
import "./conductores.css";

const API = import.meta.env.VITE_API_URL;

export default function Conductores() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    identificacion: "",
    telefono: "",
    licencia_conduccion: "",
  });

  useEffect(() => { fetchDrivers(); }, []);

  async function fetchDrivers() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/drivers`);
      const data = await res.json();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchDrivers", err);
      alert("Error fetching drivers");
    } finally { setLoading(false); }
  }

  async function createDriver(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
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
          <input placeholder="Identificación" value={form.identificacion}
            onChange={(e) => setForm({ ...form, identificacion: e.target.value })} required />
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
              {drivers.map((d) => (
                <div key={d.id} className="conductor-card">
                  <div>
                    <strong>{d.nombre}</strong>
                    <div className="conductor-info">ID: {d.identificacion}</div>
                    <div className="conductor-info">Tel: {d.telefono || "N/A"}</div>
                    <div className="conductor-info">Licencia: {d.licencia_conduccion || "N/A"}</div>
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
