import React, { useEffect, useState, useRef } from 'react';
import '../styles/dashboard.css';

const API = import.meta.env.VITE_API_URL || 'https://logisticpro.onrender.com';

export default function Dashboard() {
  const [counts, setCounts] = useState({
    orders: 0,
    clients: 0,
    warehouses: 0,
    drivers: 0,
    vehicles: 0,
  });
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  async function fetchCounts() {
    try {
      setLoading(true);

      // Llamadas paralelas a todos los recursos
      const [ordersRes, clientsRes, warehousesRes, driversRes, vehiclesRes] = await Promise.all([
        fetch(`${API}/orders`),
        fetch(`${API}/clients`),
        fetch(`${API}/warehouses`),
        fetch(`${API}/drivers`),
        fetch(`${API}/vehicles`),
      ]);

      // Manejo seguro de respuestas
      const safeJson = async (res) => (res.ok ? await res.json() : []);
      const [orders, clients, warehouses, drivers, vehicles] = await Promise.all([
        safeJson(ordersRes),
        safeJson(clientsRes),
        safeJson(warehousesRes),
        safeJson(driversRes),
        safeJson(vehiclesRes),
      ]);

      setCounts({
        orders: Array.isArray(orders) ? orders.length : 0,
        clients: Array.isArray(clients) ? clients.length : 0,
        warehouses: Array.isArray(warehouses) ? warehouses.length : 0,
        drivers: Array.isArray(drivers) ? drivers.length : 0,
        vehicles: Array.isArray(vehicles) ? vehicles.length : 0,
      });

      setLastUpdate(new Date().toLocaleString());
    } catch (err) {
      console.error('Error trayendo datos del dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCounts();

    // Actualiza cada 10 segundos
    pollingRef.current = setInterval(fetchCounts, 10000);

    // Escucha los cambios locales (por ejemplo, cuando se agrega un cliente o envío)
    function onDataChange() {
      fetchCounts();
    }
    window.addEventListener('logistic:data-changed', onDataChange);

    return () => {
      clearInterval(pollingRef.current);
      window.removeEventListener('logistic:data-changed', onDataChange);
    };
  }, []);

  const data = [
    { label: 'Envíos Activos', value: counts.orders, sub: 'Total envíos' },
    { label: 'Clientes', value: counts.clients, sub: 'Total clientes' },
    { label: 'Almacenes', value: counts.warehouses, sub: 'Total almacenes' },
    { label: 'Conductores', value: counts.drivers, sub: 'Total conductores' },
    { label: 'Vehículos', value: counts.vehicles, sub: 'Total vehículos' },
  ];

  return (
    <div className="dashboard-page p-4">
      <h1 className="dashboard-title">Dashboard General</h1>

      <div className="card summary-card">
        <h3>Resumen de Actividad</h3>
        <p>Visualiza el estado general del sistema logístico.</p>

        <div className="summary-grid">
          {data.map((item) => (
            <div key={item.label} className="stat-card">
              <h4>{item.label}</h4>
              <div className="stat-value">{loading ? '...' : item.value}</div>
              <div className="stat-sub">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card activity-card">
        <h3>Actividad reciente</h3>
        <p className="muted">
          Última actualización: {lastUpdate || 'Cargando...'}
        </p>
        <div className="activity-hint">
          Se actualiza automáticamente y al crear nuevos registros.
        </div>
      </div>
    </div>
  );
}