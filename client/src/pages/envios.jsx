import '../styles/envios.css';
import React, { useEffect, useState } from 'react';
import apiClient from '../lib/api';

export default function Envios() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFormCreate, setShowFormCreate] = useState(false);
  const [showFormEdit, setShowFormEdit] = useState(false);
  const [form, setForm] = useState({ 
    tracking_code: '', 
    client_id: '', 
    origin: '', 
    destination: '', 
    weight: '' 
  });
  const [editForm, setEditForm] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => { 
    fetchAll(); 
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [oRes, cRes] = await Promise.all([
        apiClient.get('/orders'),
        apiClient.get('/clients')
      ]);
      
      const oData = oRes.data;
      const cData = cRes.data;
      
      setOrders(Array.isArray(oData) ? oData : []);
      setClients(Array.isArray(cData) ? cData : []);
    } catch (err) {
      console.error('fetchAll', err);
      alert('Error trayendo envíos o clientes');
    } finally { 
      setLoading(false); 
    }
  }

  async function createOrder(e) {
    e.preventDefault();
    try {
      const payload = { 
        ...form, 
        client_id: Number(form.client_id), 
        weight: Number(form.weight || 0),
        status: 'pendiente'
      };
      
      const res = await apiClient.post('/orders', payload);
      const created = res.data;
      setOrders(prev => [created, ...prev]);
      setForm({ tracking_code: '', client_id: '', origin: '', destination: '', weight: '' });
      setShowFormCreate(false);
      window.dispatchEvent(new CustomEvent('logistic:data-changed', { detail: { resource: 'orders', id: created.id } }));
    } catch (err) {
      console.error('createOrder', err);
      alert('Error creando orden');
    }
  }

  function abrirEditar(order) {
    setEditForm({ ...order });
    setShowFormEdit(true);
  }

  async function editarOrder(e) {
    e.preventDefault();
    try {
      const payload = {
        tracking_code: editForm.tracking_code,
        client_id: Number(editForm.client_id),
        origin: editForm.origin,
        destination: editForm.destination,
        weight: Number(editForm.weight || 0),
        status: editForm.status || 'pendiente'
      };
      
      const res = await apiClient.put(`/orders/${editForm.id}`, payload);
      const actualizado = res.data;
      setOrders(prev => prev.map(o => o.id === actualizado.id ? actualizado : o));
      setEditForm(null);
      setShowFormEdit(false);
    } catch (err) {
      console.error('editarOrder', err);
      alert('Error editando orden');
    }
  }

  async function eliminarOrder(id) {
    if (!window.confirm('¿Estás seguro de eliminar este envío?')) return;
    try {
      await apiClient.delete(`/orders/${id}`);
      setOrders(prev => prev.filter(o => o.id !== id));
      window.dispatchEvent(new CustomEvent('logistic:data-changed', { detail: { resource: 'orders', action: 'delete' } }));
    } catch (err) {
      console.error('eliminarOrder', err);
      alert('Error eliminando orden');
    }
  }

  // Filtros y búsqueda
  const ordersFiltrados = orders.filter(o => {
    const estadoOk = !filtroEstado || (o.status || 'pendiente').toLowerCase() === filtroEstado;
    const busquedaOk = !busqueda || 
      o.tracking_code?.toLowerCase().includes(busqueda.toLowerCase()) || 
      o.origin?.toLowerCase().includes(busqueda.toLowerCase()) ||
      o.destination?.toLowerCase().includes(busqueda.toLowerCase());
    return estadoOk && busquedaOk;
  });

  const estadosDispatch = {
    'pendiente': { label: 'Pendiente', color: 'warning' },
    'en_transito': { label: 'En Tránsito', color: 'info' },
    'entregado': { label: 'Entregado', color: 'success' },
    'cancelado': { label: 'Cancelado', color: 'danger' }
  };

  return (
    <div className="envios-container">
      {/* Header Section */}
      <div className="envios-header">
        <div className="header-left">
          <h1 className="page-title">Gestión de Envíos</h1>
          <p className="page-subtitle">Administra y monitorea tus envíos</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowFormCreate(true)}
        >
          <span className="btn-icon">+</span>
          <span className="btn-text">Nuevo Envío</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-item">
          <div className="stat-number">{orders.length}</div>
          <div className="stat-label">Total de Envíos</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{orders.filter(o => (o.status || 'pendiente') === 'pendiente').length}</div>
          <div className="stat-label">Pendientes</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{orders.filter(o => (o.status || 'pendiente') === 'en_transito').length}</div>
          <div className="stat-label">En Tránsito</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{orders.filter(o => (o.status || 'pendiente') === 'entregado').length}</div>
          <div className="stat-label">Entregados</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Buscar por código, origen o destino..."
            className="search-input"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="filters-group">
          <select 
            className="filter-select" 
            value={filtroEstado} 
            onChange={e => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_transito">En Tránsito</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Modal Create */}
      {showFormCreate && (
        <div className="modal-overlay" onClick={() => setShowFormCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear Nuevo Envío</h3>
              <button 
                className="modal-close"
                onClick={() => setShowFormCreate(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={createOrder} className="form-group">
              <div className="form-field">
                <label>Código de Rastreo</label>
                <input 
                  type="text"
                  placeholder="Ej: TRACK-2024-001"
                  value={form.tracking_code} 
                  onChange={e => setForm({...form, tracking_code: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-field">
                <label>Cliente</label>
                <select 
                  value={form.client_id} 
                  onChange={e => setForm({...form, client_id: e.target.value})} 
                  required
                >
                  <option value="">Selecciona un cliente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Origen</label>
                  <input 
                    type="text"
                    placeholder="Ej: Bogotá"
                    value={form.origin} 
                    onChange={e => setForm({...form, origin: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-field">
                  <label>Destino</label>
                  <input 
                    type="text"
                    placeholder="Ej: Medellín"
                    value={form.destination} 
                    onChange={e => setForm({...form, destination: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="form-field">
                <label>Peso (kg)</label>
                <input 
                  type="number"
                  placeholder="0"
                  step="0.1"
                  value={form.weight} 
                  onChange={e => setForm({...form, weight: e.target.value})} 
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowFormCreate(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-success">
                  Crear Envío
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {showFormEdit && editForm && (
        <div className="modal-overlay" onClick={() => setShowFormEdit(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Envío</h3>
              <button 
                className="modal-close"
                onClick={() => setShowFormEdit(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={editarOrder} className="form-group">
              <div className="form-field">
                <label>Código de Rastreo</label>
                <input 
                  type="text"
                  value={editForm.tracking_code} 
                  onChange={e => setEditForm({...editForm, tracking_code: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-field">
                <label>Cliente</label>
                <select 
                  value={editForm.client_id} 
                  onChange={e => setEditForm({...editForm, client_id: e.target.value})} 
                  required
                >
                  <option value="">Selecciona un cliente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Origen</label>
                  <input 
                    type="text"
                    value={editForm.origin} 
                    onChange={e => setEditForm({...editForm, origin: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-field">
                  <label>Destino</label>
                  <input 
                    type="text"
                    value={editForm.destination} 
                    onChange={e => setEditForm({...editForm, destination: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Peso (kg)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={editForm.weight} 
                    onChange={e => setEditForm({...editForm, weight: e.target.value})} 
                  />
                </div>
                <div className="form-field">
                  <label>Estado</label>
                  <select 
                    value={editForm.status || 'pendiente'} 
                    onChange={e => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_transito">En Tránsito</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowFormEdit(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="table-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando envíos...</p>
          </div>
        ) : ordersFiltrados.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <h3>No hay envíos</h3>
            <p>No se encontraron envíos con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Código de Rastreo</th>
                  <th>Cliente</th>
                  <th>Ruta</th>
                  <th>Peso</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordersFiltrados.map((order) => (
                  <tr key={order.id} className="table-row">
                    <td className="cell-id">
                      <span className="id-badge">#{order.id}</span>
                    </td>
                    <td className="cell-tracking">
                      <span className="tracking-icon">📦</span>
                      <span className="tracking-code">{order.tracking_code}</span>
                    </td>
                    <td className="cell-client">
                      {order.client_name || `Cliente #${order.client_id}`}
                    </td>
                    <td className="cell-route">
                      <div className="route-info">
                        <span className="origin">📍 {order.origin}</span>
                        <span className="arrow">→</span>
                        <span className="destination">🎯 {order.destination}</span>
                      </div>
                    </td>
                    <td className="cell-weight">
                      {order.weight ? `${order.weight} kg` : '—'}
                    </td>
                    <td className="cell-status">
                      <span className={`status-badge status-${order.status || 'pendiente'}`}>
                        {estadosDispatch[order.status || 'pendiente']?.label || 'Pendiente'}
                      </span>
                    </td>
                    <td className="cell-date">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="cell-actions">
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => abrirEditar(order)}
                          title="Editar envío"
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => eliminarOrder(order.id)}
                          title="Eliminar envío"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}