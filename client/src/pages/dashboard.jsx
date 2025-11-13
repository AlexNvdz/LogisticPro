import React, { useEffect, useState, useRef } from 'react';
import '../styles/dashboard.css';
import apiClient from '../lib/api'; 

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

  // --- CAMBIO 1: Revisamos el rol del usuario ---
  const isAdmin = localStorage.getItem("isadmin") === "true";

  async function fetchCounts() {
    try {
      setLoading(true);

      // --- CAMBIO 2: Peticiones condicionales ---
      
      // Todos los usuarios (admin o no) piden esto:
      const commonRequests = [
        apiClient.get('/orders'),
        apiClient.get('/clients')
      ];

      // Solo los admins piden el resto:
      const adminRequests = isAdmin ? [
        apiClient.get('/warehouses'),
        apiClient.get('/drivers'),
        apiClient.get('/vehicles'),
      ] : [];

      // Unimos las peticiones
      const allRequests = [...commonRequests, ...adminRequests];
      const results = await Promise.all(allRequests);

      // Asignamos las respuestas
      const [ordersRes, clientsRes, warehousesRes, driversRes, vehiclesRes] = results;

      // --- CAMBIO 3: Usamos optional chaining (?.data) ---
      // Si las respuestas de admin no existen, '?.data' devolverá undefined
      // y el conteo será 0, sin dar error.
      setCounts({
        orders: Array.isArray(ordersRes?.data) ? ordersRes.data.length : 0,
        clients: Array.isArray(clientsRes?.data) ? clientsRes.data.length : 0,
        warehouses: Array.isArray(warehousesRes?.data) ? warehousesRes.data.length : 0,
        drivers: Array.isArray(driversRes?.data) ? driversRes.data.length : 0,
        vehicles: Array.isArray(vehiclesRes?.data) ? vehiclesRes.data.length : 0,
      });

      setLastUpdate(new Date().toLocaleString());
    } catch (err) {
      // Los errores 403 ya no deberían ocurrir, pero dejamos el log
      console.error('Error trayendo datos del dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCounts();
    pollingRef.current = setInterval(fetchCounts, 10000);

    function onDataChange() {
      fetchCounts();
    }
    window.addEventListener('logistic:data-changed', onDataChange);

    return () => {
      clearInterval(pollingRef.current);
      window.removeEventListener('logistic:data-changed', onDataChange);
    };
  }, []); // El 'isAdmin' no cambia, así que no es dependencia

  // --- CAMBIO 4: Filtramos las tarjetas que se van a mostrar ---
  const allDataCards = [
    { label: 'Envíos Activos', value: counts.orders, sub: 'Total envíos', admin: false },
    { label: 'Clientes', value: counts.clients, sub: 'Total clientes', admin: false },
    { label: 'Almacenes', value: counts.warehouses, sub: 'Total almacenes', admin: true },
    { label: 'Conductores', value: counts.drivers, sub: 'Total conductores', admin: true },
    { label: 'Vehículos', value: counts.vehicles, sub: 'Total vehículos', admin: true },
  ];

  // Mostramos solo las tarjetas comunes, o todas si es admin
  const data = allDataCards.filter(item => !item.admin || isAdmin);

  return (
    <div className="dashboard-page p-4">
      <h1 className="dashboard-title">Dashboard General</h1>

      <div className="card summary-card">
        <h3>Resumen de Actividad</h3>
        <p>Visualiza el estado general del sistema logístico.</p>

        <div className="summary-grid">
          {/* El .map() ahora usa la 'data' filtrada */}
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