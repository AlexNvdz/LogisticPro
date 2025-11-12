import React, { useEffect, useState, useRef } from 'react';
import '../styles/dashboard.css';

// 1. Importamos tu nuevo cliente 'apiClient'
import apiClient from '../lib/api'; // (Asegúrate que la ruta sea correcta)

// 2. Ya no necesitamos la variable 'API', apiClient la gestiona
// const API = import.meta.env.VITE_API_URL || 'https://logisticpro.onrender.com';

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

      // 3. Usamos 'apiClient.get' en lugar de 'fetch'.
      // El token se añade automáticamente gracias al interceptor.
      const [ordersRes, clientsRes, warehousesRes, driversRes, vehiclesRes] = await Promise.all([
        apiClient.get('/orders'),
        apiClient.get('/clients'),
        apiClient.get('/warehouses'),
        apiClient.get('/drivers'),
        apiClient.get('/vehicles'),
      ]);

      // 4. axios pone la respuesta en la propiedad .data
      // Ya no necesitamos la función 'safeJson'
      setCounts({
        orders: Array.isArray(ordersRes.data) ? ordersRes.data.length : 0,
        clients: Array.isArray(clientsRes.data) ? clientsRes.data.length : 0,
        warehouses: Array.isArray(warehousesRes.data) ? warehousesRes.data.length : 0,
        drivers: Array.isArray(driversRes.data) ? driversRes.data.length : 0,
        vehicles: Array.isArray(vehiclesRes.data) ? vehiclesRes.data.length : 0,
      });

      setLastUpdate(new Date().toLocaleString());
    } catch (err) {
      console.error('Error trayendo datos del dashboard:', err);
      // Opcional: si el error es 401 (token expirado), podríamos redirigir al login
      if (err.response && err.response.status === 401) {
        console.error("Token no válido o expirado. Redirigiendo a login...");
        // Aquí podrías limpiar localStorage y redirigir
        // localStorage.clear();
        // window.location.href = '/login'; 
      }
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