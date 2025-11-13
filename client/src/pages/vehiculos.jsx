import React, { useEffect, useState } from "react";
import "../styles/vehiculos.css";
import apiClient from '../lib/api';

export default function Vehiculos() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFormCreate, setShowFormCreate] = useState(false);
  const [showFormEdit, setShowFormEdit] = useState(false);
  const [form, setForm] = useState({ plate: "", model: "", capacity: "" });
  const [editForm, setEditForm] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => { 
    fetchVehicles(); 
  }, []);

  async function fetchVehicles() {
    setLoading(true);
    try {
      const res = await apiClient.get('/vehicles');
      setVehicles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("fetchVehicles", err);
      alert("Error cargando vehículos");
    } finally { 
      setLoading(false); 
    }
  }

  async function createVehicle(e) {
    e.preventDefault();
    try {
      const payload = {
        plate: form.plate.toUpperCase(),
        model: form.model,
        capacity: Number(form.capacity || 0),
        status: 'available'
      };
      
      const res = await apiClient.post('/vehicles', payload);
      const created = res.data;
      setVehicles((prev) => [created, ...prev]);
      setForm({ plate: "", model: "", capacity: "" });
      setShowFormCreate(false);
      window.dispatchEvent(new CustomEvent('logistic:data-changed', { detail: { resource: 'vehicles', id: created.id } }));
    } catch (err) {
      console.error("createVehicle", err);
      alert("Error creando vehículo");
    }
  }

  function abrirEditar(vehicle) {
    setEditForm({ ...vehicle });
    setShowFormEdit(true);
  }

  async function editarVehicle(e) {
    e.preventDefault();
    try {
      const payload = {
        plate: editForm.plate.toUpperCase(),
        model: editForm.model,
        capacity: Number(editForm.capacity || 0),
        status: editForm.status || 'available'
      };
      
      const res = await apiClient.put(`/vehicles/${editForm.id}`, payload);
      const actualizado = res.data;
      setVehicles(prev => prev.map(v => v.id === actualizado.id ? actualizado : v));
      setEditForm(null);
      setShowFormEdit(false);
    } catch (err) {
      console.error("editarVehicle", err);
      alert("Error editando vehículo");
    }
  }

  async function eliminarVehicle(id) {
    if (!window.confirm('¿Estás seguro de eliminar este vehículo?')) return;
    try {
      await apiClient.delete(`/vehicles/${id}`);
      setVehicles(prev => prev.filter(v => v.id !== id));
      window.dispatchEvent(new CustomEvent('logistic:data-changed', { detail: { resource: 'vehicles', action: 'delete' } }));
    } catch (err) {
      console.error("eliminarVehicle", err);
      alert("Error eliminando vehículo");
    }
  }

  const vehiclesFiltrados = vehicles.filter(v => {
    const busquedaOk = !busqueda || 
      v.plate?.toLowerCase().includes(busqueda.toLowerCase()) || 
      v.model?.toLowerCase().includes(busqueda.toLowerCase());
    return busquedaOk;
  });

  const estadosVehiculos = {
    'available': { label: 'Disponible', color: 'success', icon: '✓' },
    'in_use': { label: 'En Uso', color: 'info', icon: '🚗' },
    'maintenance': { label: 'Mantenimiento', color: 'warning', icon: '🔧' },
    'inactive': { label: 'Inactivo', color: 'danger', icon: '✕' }
  };

  return (
    <div className="vehiculos-container">
      {/* Header Section */}
      <div className="vehiculos-header">
        <div className="header-left">
          <h1 className="page-title">Gestión de Vehículos</h1>
          <p className="page-subtitle">Administra tu flota de vehículos</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowFormCreate(true)}
        >
          <span className="btn-icon">+</span>
          <span className="btn-text">Nuevo Vehículo</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-item">
          <div className="stat-number">{vehicles.length}</div>
          <div className="stat-label">Total de Vehículos</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{vehicles.filter(v => (v.status || 'available') === 'available').length}</div>
          <div className="stat-label">Disponibles</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{vehicles.filter(v => (v.status || 'available') === 'in_use').length}</div>
          <div className="stat-label">En Uso</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{vehicles.filter(v => (v.status || 'available') === 'maintenance').length}</div>
          <div className="stat-label">Mantenimiento</div>
        </div>
      </div>

      {/* Search */}
      <div className="search-filters-section">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Buscar por placa o modelo..."
            className="search-input"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* Modal Create */}
      {showFormCreate && (
        <div className="modal-overlay" onClick={() => setShowFormCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear Nuevo Vehículo</h3>
              <button 
                className="modal-close"
                onClick={() => setShowFormCreate(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={createVehicle} className="form-group">
              <div className="form-field">
                <label>Placa</label>
                <input 
                  type="text"
                  placeholder="Ej: ABC-1234"
                  value={form.plate} 
                  onChange={e => setForm({...form, plate: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-field">
                <label>Modelo</label>
                <input 
                  type="text"
                  placeholder="Ej: Chevrolet NHR"
                  value={form.model} 
                  onChange={e => setForm({...form, model: e.target.value})} 
                  required
                />
              </div>
              <div className="form-field">
                <label>Capacidad de Carga (kg)</label>
                <input 
                  type="number"
                  placeholder="2000"
                  step="100"
                  value={form.capacity} 
                  onChange={e => setForm({...form, capacity: e.target.value})} 
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowFormCreate(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-success">
                  Crear Vehículo
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
              <h3>Editar Vehículo</h3>
              <button 
                className="modal-close"
                onClick={() => setShowFormEdit(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={editarVehicle} className="form-group">
              <div className="form-field">
                <label>Placa</label>
                <input 
                  type="text"
                  value={editForm.plate} 
                  onChange={e => setEditForm({...editForm, plate: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-field">
                <label>Modelo</label>
                <input 
                  type="text"
                  value={editForm.model} 
                  onChange={e => setEditForm({...editForm, model: e.target.value})} 
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Capacidad de Carga (kg)</label>
                  <input 
                    type="number"
                    step="100"
                    value={editForm.capacity} 
                    onChange={e => setEditForm({...editForm, capacity: e.target.value})} 
                  />
                </div>
                <div className="form-field">
                  <label>Estado</label>
                  <select 
                    value={editForm.status || 'available'} 
                    onChange={e => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="available">Disponible</option>
                    <option value="in_use">En Uso</option>
                    <option value="maintenance">Mantenimiento</option>
                    <option value="inactive">Inactivo</option>
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

      {/* Cards Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando vehículos...</p>
        </div>
      ) : vehiclesFiltrados.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🚗</span>
          <h3>No hay vehículos</h3>
          <p>No se encontraron vehículos con los filtros seleccionados</p>
        </div>
      ) : (
        <div className="vehicles-grid">
          {vehiclesFiltrados.map((vehicle) => (
            <div key={vehicle.id} className="vehicle-card">
              <div className="card-header">
                <div className="vehicle-icon">🚛</div>
                <div className="card-status">
                  <span className={`status-badge status-${vehicle.status || 'available'}`}>
                    {estadosVehiculos[vehicle.status || 'available']?.label || 'Disponible'}
                  </span>
                </div>
              </div>

              <div className="card-body">
                <div className="vehicle-plate">
                  <span className="plate-label">Placa</span>
                  <span className="plate-value">{vehicle.plate}</span>
                </div>

                <div className="vehicle-model">
                  <span className="model-label">Modelo</span>
                  <span className="model-value">{vehicle.model}</span>
                </div>

                <div className="vehicle-detail">
                  <span className="detail-icon">⚖️</span>
                  <div className="detail-content">
                    <span className="detail-label">Capacidad</span>
                    <span className="detail-value">
                      {vehicle.capacity ? `${vehicle.capacity} kg` : 'No especificada'}
                    </span>
                  </div>
                </div>

                <div className="vehicle-detail">
                  <span className="detail-icon">📅</span>
                  <div className="detail-content">
                    <span className="detail-label">Registrado</span>
                    <span className="detail-value">
                      {vehicle.created_at ? new Date(vehicle.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <button
                  onClick={() => abrirEditar(vehicle)}
                  className="action-btn edit-btn"
                  title="Editar vehículo"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => eliminarVehicle(vehicle.id)}
                  className="action-btn delete-btn"
                  title="Eliminar vehículo"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}