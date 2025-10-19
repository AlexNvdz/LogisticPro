// client/src/pages/dashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import './dashboard.css'; // te doy estilo abajo

const API = import.meta.env.VITE_API_URL || 'https://logisticpro.onrender.com';

export default function Dashboard() {
  const [counts, setCounts] = useState({
    orders: 0,
    clients: 0,
    warehouses: 0,
    drivers: 0,
    vehicles: 0,
  });
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef(null);

  async function fetchCounts() {
    setLoading(true);
    try {
      // Llamamos a endpoints existentes y contamos filas (pequeño coste)
      const [ordersRes, clientsRes, warehousesRes, driversRes, vehiclesRes] = await Promise.all([
        fetch(`${API}/orders`),
        fetch(`${API}/clients`),
        fetch(`${API}/warehouses`),
        fetch(`${API}/drivers`),
        fetch(`${API}/vehicles`)
      ]);

      // Si algún fetch falla, no romper todo
      const orders = ordersRes.ok ? await ordersRes.json() : [];
      const clients = clientsRes.ok ? await clientsRes.json() : [];
      const warehouses = warehousesRes.ok ? await warehousesRes.json() : [];
      const drivers = driversRes.ok ? await driversRes.json() : [];
      const vehicles = vehiclesRes.ok ? await vehiclesRes.json() : [];

      setCounts({
        orders: Array.isArray(orders) ? orders.length : 0,
        clients: Array.isArray(clients) ? clients.length : 0,
        warehouses: Array.isArray(warehouses) ? warehouses.length : 0,
        drivers: Array.isArray(drivers) ? drivers.length : 0,
        vehicles: Array.isArray(vehicles) ? vehicles.length : 0
      });
    } catch (err) {
      console.error('fetchCounts error', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // fetch inicial
    fetchCounts();

    // polling cada 8s (ajustable)
    pollingRef.current = setInterval(fetchCounts, 8000);

    // escuchar eventos locales para refresh inmediato
    function onDataChange(e) {
      // puedes inspeccionar e.detail.resource si quieres refrescar solo uno
      fetchCounts();
    }
    window.addEventListener('logistic:data-changed', onDataChange);

    return () => {
      clearInterval(pollingRef.current);
      window.removeEventListener('logistic:data-changed', onDataChange);
    };
  }, []);

  return (
    <div className="dashboard-page p-4">
      <h1 className="dashboard-title">Dashboard General</h1>

      <div className="card summary-card">
        <h3>Resumen de Actividad</h3>
        <p>Visualiza el estado general del sistema logístico.</p>

        <div className="summary-grid">
          <div className="stat-card">
            <h4>Envíos Activos</h4>
            <div className="stat-value">{loading ? '...' : counts.orders}</div>
            <div className="stat-sub">Total envíos</div>
          </div>

          <div className="stat-card">
            <h4>Clientes</h4>
            <div className="stat-value">{loading ? '...' : counts.clients}</div>
            <div className="stat-sub">Total clientes</div>
          </div>

          <div className="stat-card">
            <h4>Almacenes</h4>
            <div className="stat-value">{loading ? '...' : counts.warehouses}</div>
            <div className="stat-sub">Total almacenes</div>
          </div>

          <div className="stat-card">
            <h4>Conductores</h4>
            <div className="stat-value">{loading ? '...' : counts.drivers}</div>
            <div className="stat-sub">Total conductores</div>
          </div>

          <div className="stat-card">
            <h4>Vehículos</h4>
            <div className="stat-value">{loading ? '...' : counts.vehicles}</div>
            <div className="stat-sub">Total vehículos</div>
          </div>
        </div>
      </div>

      <div className="card activity-card">
        <h3>Actividad reciente</h3>
        <p className="muted">Última actualización: {new Date().toLocaleString()}</p>
        <div className="activity-hint">Se actualiza automáticamente y al crear nuevos registros.</div>
      </div>
    </div>
  );
}
