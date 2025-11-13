import { useState, useEffect } from 'react';
import apiClient from '../lib/api';
import '../styles/almacenes.css';

export default function Almacenes() {
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFormCreate, setShowFormCreate] = useState(false);
  const [showFormEdit, setShowFormEdit] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', capacity: '', manager: '' });
  const [editForm, setEditForm] = useState(null);
  const [filtroCiudad, setFiltroCiudad] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchAlmacenes();
  }, []);

  async function fetchAlmacenes() {
    setLoading(true);
    try {
      const res = await apiClient.get('/warehouses');
      setAlmacenes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error cargando almacenes:', err);
    } finally {
      setLoading(false);
    }
  }

  async function crearAlmacen(e) {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        location: form.location,
        capacity: Number(form.capacity) || 0,
        manager: form.manager
      };

      const res = await apiClient.post('/warehouses', payload);
      const nuevo = res.data;
      setAlmacenes(prev => [nuevo, ...prev]);
      setForm({ name: '', location: '', capacity: '', manager: '' });
      setShowFormCreate(false);
      window.dispatchEvent(new CustomEvent('logistic:data-changed', { detail: { resource: 'warehouses', id: nuevo.id } }));
    } catch (err) {
      console.error('Error creando almacén:', err);
      alert('Error creando almacén');
    }
  }

  function abrirEditar(almacen) {
    setEditForm({ ...almacen });
    setShowFormEdit(true);
  }

  async function editarAlmacen(e) {
    e.preventDefault();
    try {
      const payload = {
        name: editForm.name,
        location: editForm.location,
        capacity: Number(editForm.capacity) || 0,
        manager: editForm.manager,
        status: editForm.status || 'activo'
      };

      const res = await apiClient.put(`/warehouses/${editForm.id}`, payload);
      const actualizado = res.data;
      setAlmacenes(prev => prev.map(a => a.id === actualizado.id ? actualizado : a));
      setEditForm(null);
      setShowFormEdit(false);
    } catch (err) {
      console.error('Error editando almacén:', err);
      alert('Error editando almacén');
    }
  }

  async function eliminarAlmacen(id) {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este almacén?')) return;
    try {
      await apiClient.delete(`/warehouses/${id}`);
      setAlmacenes(prev => prev.filter(a => a.id !== id));
      window.dispatchEvent(new CustomEvent('logistic:data-changed', { detail: { resource: 'warehouses', action: 'delete' } }));
    } catch (err) {
      console.error('Error eliminando almacén:', err);
      alert('Error eliminando almacén');
    }
  }

  // Filtros y búsqueda
  const almacenesFiltrados = almacenes.filter(a => {
    const ciudadOk = !filtroCiudad || a.location?.toLowerCase() === filtroCiudad;
    const estadoOk = !filtroEstado || (a.status ? a.status.toLowerCase() : 'activo') === filtroEstado;
    const busquedaOk = !busqueda || a.name?.toLowerCase().includes(busqueda.toLowerCase()) || a.location?.toLowerCase().includes(busqueda.toLowerCase());
    return ciudadOk && estadoOk && busquedaOk;
  });

  const ciudades = [...new Set(almacenes.map(a => a.location).filter(Boolean))];

  return (
    <div className="almacenes-container">
      {/* Header Section */}
      <div className="almacenes-header">
        <div className="header-left">
          <h1 className="page-title">Gestión de Almacenes</h1>
          <p className="page-subtitle">Administra y monitorea todos tus almacenes</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowFormCreate(true)}
        >
          <span className="btn-icon">+</span>
          <span className="btn-text">Nuevo Almacén</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-item">
          <div className="stat-number">{almacenes.length}</div>
          <div className="stat-label">Total de Almacenes</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{almacenes.filter(a => (a.status || 'activo') === 'activo').length}</div>
          <div className="stat-label">Almacenes Activos</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{ciudades.length}</div>
          <div className="stat-label">Ciudades</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{Math.round(almacenes.reduce((sum, a) => sum + (a.capacity || 0), 0) / (almacenes.length || 1))}%</div>
          <div className="stat-label">Capacidad Promedio</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Buscar por nombre o ciudad..."
            className="search-input"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="filters-group">
          <select 
            className="filter-select" 
            value={filtroCiudad} 
            onChange={e => setFiltroCiudad(e.target.value)}
          >
            <option value="">Todas las ciudades</option>
            {ciudades.map(ciudad => (
              <option key={ciudad} value={ciudad?.toLowerCase()}>{ciudad}</option>
            ))}
          </select>
          <select 
            className="filter-select" 
            value={filtroEstado} 
            onChange={e => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Modal Create */}
      {showFormCreate && (
        <div className="modal-overlay" onClick={() => setShowFormCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear Nuevo Almacén</h3>
              <button 
                className="modal-close"
                onClick={() => setShowFormCreate(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={crearAlmacen} className="form-group">
              <div className="form-field">
                <label>Nombre del Almacén</label>
                <input 
                  type="text"
                  placeholder="Ej: Almacén Central"
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-field">
                <label>Ciudad</label>
                <input 
                  type="text"
                  placeholder="Ej: Bogotá"
                  value={form.location} 
                  onChange={e => setForm({...form, location: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-field">
                <label>Capacidad (%)</label>
                <input 
                  type="number"
                  placeholder="0-100"
                  value={form.capacity} 
                  onChange={e => setForm({...form, capacity: e.target.value})} 
                  min={0} 
                  max={100}
                />
              </div>
              <div className="form-field">
                <label>Responsable</label>
                <input 
                  type="text"
                  placeholder="Nombre del responsable"
                  value={form.manager} 
                  onChange={e => setForm({...form, manager: e.target.value})} 
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowFormCreate(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-success">
                  Crear Almacén
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
              <h3>Editar Almacén</h3>
              <button 
                className="modal-close"
                onClick={() => setShowFormEdit(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={editarAlmacen} className="form-group">
              <div className="form-field">
                <label>Nombre del Almacén</label>
                <input 
                  type="text"
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-field">
                <label>Ciudad</label>
                <input 
                  type="text"
                  value={editForm.location} 
                  onChange={e => setEditForm({...editForm, location: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-field">
                <label>Capacidad (%)</label>
                <input 
                  type="number"
                  value={editForm.capacity} 
                  onChange={e => setEditForm({...editForm, capacity: e.target.value})} 
                  min={0} 
                  max={100}
                />
              </div>
              <div className="form-field">
                <label>Responsable</label>
                <input 
                  type="text"
                  value={editForm.manager} 
                  onChange={e => setEditForm({...editForm, manager: e.target.value})} 
                />
              </div>
              <div className="form-field">
                <label>Estado</label>
                <select 
                  value={editForm.status || 'activo'} 
                  onChange={e => setEditForm({...editForm, status: e.target.value})}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
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
            <p>Cargando almacenes...</p>
          </div>
        ) : almacenesFiltrados.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <h3>No hay almacenes</h3>
            <p>No se encontraron almacenes con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Ciudad</th>
                  <th>Capacidad</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {almacenesFiltrados.map((almacen) => (
                  <tr key={almacen.id} className="table-row">
                    <td className="cell-id">
                      <span className="id-badge">{almacen.id}</span>
                    </td>
                    <td className="cell-name">
                      <span className="warehouse-icon">🏭</span>
                      {almacen.name}
                    </td>
                    <td className="cell-location">
                      <span className="location-icon">📍</span>
                      {almacen.location}
                    </td>
                    <td className="cell-capacity">
                      <div className="capacity-container">
                        <div className="capacity-bar">
                          <div 
                            className="capacity-fill" 
                            style={{width: `${almacen.capacity || 0}%`}}
                          ></div>
                        </div>
                        <span className="capacity-text">{almacen.capacity || 0}%</span>
                      </div>
                    </td>
                    <td className="cell-manager">
                      <span className="manager-badge">
                        👤 {almacen.manager || 'N/A'}
                      </span>
                    </td>
                    <td className="cell-status">
                      <span className={`status-badge status-${almacen.status ? almacen.status.toLowerCase() : 'activo'}`}>
                        {almacen.status ? almacen.status.charAt(0).toUpperCase() + almacen.status.slice(1) : 'Activo'}
                      </span>
                    </td>
                    <td className="cell-actions">
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => abrirEditar(almacen)}
                          title="Editar almacén"
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => eliminarAlmacen(almacen.id)}
                          title="Eliminar almacén"
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