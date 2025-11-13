import React, { useEffect, useState, useRef } from 'react';
import '../styles/dashboard.css';
import apiClient from '../lib/api';
import {
  LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

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

  const isAdmin = localStorage.getItem("isadmin") === "true";

  // Datos simulados para gráficos
  const deliveryTrendData = [
    { name: 'Lun', entregas: 65, completadas: 55 },
    { name: 'Mar', entregas: 59, completadas: 48 },
    { name: 'Mie', entregas: 80, completadas: 72 },
    { name: 'Jue', entregas: 81, completadas: 75 },
    { name: 'Vie', entregas: 56, completadas: 50 },
    { name: 'Sab', entregas: 55, completadas: 48 },
    { name: 'Dom', entregas: 40, completadas: 35 }
  ];

  const warehouseDistribution = [
    { name: 'Bogotá Central', value: 35, fill: '#2563eb' },
    { name: 'Medellín Norte', value: 25, fill: '#3b82f6' },
    { name: 'Cali Este', value: 20, fill: '#60a5fa' },
    { name: 'Barranquilla Sur', value: 20, fill: '#93c5fd' }
  ];

  const recentActivities = [
    { id: 1, type: 'envio', description: 'Envío #12345 entregado exitosamente', time: '10:30 AM', icon: '✓' },
    { id: 2, type: 'almacen', description: 'Stock actualizado en Bogotá Central', time: '09:15 AM', icon: '📦' },
    { id: 3, type: 'ruta', description: 'Nueva ruta optimizada creada #R789', time: '08:45 AM', icon: '📍' },
    { id: 4, type: 'cliente', description: 'Nuevo cliente registrado: Transportes XYZ', time: '07:20 AM', icon: '👤' }
  ];

  async function fetchCounts() {
    try {
      setLoading(true);

      const commonRequests = [
        apiClient.get('/orders'),
        apiClient.get('/clients')
      ];

      const adminRequests = isAdmin ? [
        apiClient.get('/warehouses'),
        apiClient.get('/drivers'),
        apiClient.get('/vehicles'),
      ] : [];

      const allRequests = [...commonRequests, ...adminRequests];
      const results = await Promise.all(allRequests);

      const [ordersRes, clientsRes, warehousesRes, driversRes, vehiclesRes] = results;

      setCounts({
        orders: Array.isArray(ordersRes?.data) ? ordersRes.data.length : 0,
        clients: Array.isArray(clientsRes?.data) ? clientsRes.data.length : 0,
        warehouses: Array.isArray(warehousesRes?.data) ? warehousesRes.data.length : 0,
        drivers: Array.isArray(driversRes?.data) ? driversRes.data.length : 0,
        vehicles: Array.isArray(vehiclesRes?.data) ? vehiclesRes.data.length : 0,
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
    pollingRef.current = setInterval(fetchCounts, 10000);

    function onDataChange() {
      fetchCounts();
    }
    window.addEventListener('logistic:data-changed', onDataChange);

    return () => {
      clearInterval(pollingRef.current);
      window.removeEventListener('logistic:data-changed', onDataChange);
    };
  }, []);

  const allDataCards = [
    { label: 'Envíos Activos', value: counts.orders, sub: 'Total envíos', icon: '📦', color: '#2563eb', admin: false },
    { label: 'Clientes', value: counts.clients, sub: 'Total clientes', icon: '👥', color: '#10b981', admin: false },
    { label: 'Almacenes', value: counts.warehouses, sub: 'Total almacenes', icon: '🏭', color: '#f59e0b', admin: true },
    { label: 'Conductores', value: counts.drivers, sub: 'Total conductores', icon: '🚚', color: '#8b5cf6', admin: true },
    { label: 'Vehículos', value: counts.vehicles, sub: 'Total vehículos', icon: '🚗', color: '#ec4899', admin: true },
  ];

  const data = allDataCards.filter(item => !item.admin || isAdmin);

  return (
    <div className="dashboard-page">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="dashboard-title">Panel de Control</h1>
            <p className="dashboard-subtitle">Bienvenido al centro de operaciones logísticas</p>
          </div>
          <div className="header-stats">
            <div className="update-info">
              <span className="update-label">Última actualización:</span>
              <span className="update-time">{lastUpdate || 'Cargando...'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {data.map((item) => (
          <div key={item.label} className="stat-card" style={{ borderLeftColor: item.color }}>
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: `${item.color}20` }}>
                {item.icon}
              </div>
              <h3 className="stat-label">{item.label}</h3>
            </div>
            <div className="stat-content">
              <div className="stat-value" style={{ color: item.color }}>
                {loading ? '...' : item.value}
              </div>
              <p className="stat-sub">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Delivery Trend Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>Tendencia de Entregas</h2>
            <span className="chart-period">Últimos 7 días</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={deliveryTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEntregas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCompletadas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="entregas" stroke="#2563eb" fillOpacity={1} fill="url(#colorEntregas)" />
              <Area type="monotone" dataKey="completadas" stroke="#10b981" fillOpacity={1} fill="url(#colorCompletadas)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Warehouse Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>Distribución por Almacén</h2>
            <span className="chart-period">Capacidad actual</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={warehouseDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {warehouseDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="warehouse-legend">
            {warehouseDistribution.map((item) => (
              <div key={item.name} className="legend-item">
                <span className="legend-color" style={{ backgroundColor: item.fill }}></span>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <div className="activity-header">
          <h2>Actividad Reciente</h2>
          <a href="#" className="view-all">Ver todo →</a>
        </div>
        <div className="activity-list">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">{activity.icon}</div>
              <div className="activity-content">
                <p className="activity-description">{activity.description}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}