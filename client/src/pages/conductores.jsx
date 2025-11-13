// client/src/pages/conductores.jsx

import React, { useEffect, useState } from "react";
import "../styles/conductores.css";
import apiClient from '../lib/api';

export default function Conductores() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFormCreate, setShowFormCreate] = useState(false);
  const [showFormEdit, setShowFormEdit] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    license_number: "",
  });
  const [editForm, setEditForm] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => { 
    fetchDrivers(); 
  }, []);

  async function fetchDrivers() {
    setLoading(true);
    try {
      const res = await apiClient.get('/drivers');
      setDrivers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("fetchDrivers", err);
      alert("Error cargando conductores");
    } finally { 
      setLoading(false); 
    }
  }

  async function createDriver(e) {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        license_number: form.license_number
      };
      
      const res = await apiClient.post('/drivers', payload); 
      const created = res.data;
      setDrivers((prev) => [created, ...prev]);
      setForm({
        name: "",
        phone: "",
        license_number: "",
      });
      setShowFormCreate(false);
      window.dispatchEvent(new CustomEvent('logistic:data-changed', { detail: { resource: 'drivers', id: created.id } }));
    } catch (err) {
      console.error("createDriver", err);
      alert("Error creando conductor");
    }
  }

  function abrirEditar(driver) {
    setEditForm({ ...driver });
    setShowFormEdit(true);
  }

  async function editarDriver(e) {
    e.preventDefault();
    try {
      const payload = {
        name: editForm.name,
        phone: editForm.phone,
        license_number: editForm.license_number
      };
      
      const res = await apiClient.put(`/drivers/${editForm.id}`, payload);
      const actualizado = res.data;
      setDrivers(prev => prev.map(d => d.id === actualizado.id ? actualizado : d));
      setEditForm(null);
      setShowFormEdit(false);
    } catch (err) {
      console.error("editarDriver", err);
      alert("Error editando conductor");
    }
  }

  async function eliminarDriver(id) {
    if (!window.confirm('¿Estás seguro de eliminar este conductor?')) return;
    try {
      await apiClient.delete(`/drivers/${id}`);
      setDrivers(prev => prev.filter(d => d.id !== id));
      window.dispatchEvent(new CustomEvent('logistic:data-changed', { detail: { resource: 'drivers', action: 'delete' } }));
    } catch (err) {
      console.error("eliminarDriver", err);
      alert("Error eliminando conductor");
    }
  }

  // Filtros y búsqueda
  const driversFiltrados = drivers.filter(d => {
    const busquedaOk = !busqueda || 
      d.name?.toLowerCase().includes(busqueda.toLowerCase()) || 
      d.phone?.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.license_number?.toLowerCase().includes(busqueda.toLowerCase());
    return busquedaOk;
  });

  return (
    <div className="conductores-container">
      {/* Header Section */}
      <div className="conductores-header">
        <div className="header-left">
          <h1 className="page-title">Gestión de Conductores</h1>
          <p className="page-subtitle">Administra el equipo de conductores de tu flota</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowFormCreate(true)}
        >
          <span className="btn-icon">+</span>
          <span className="btn-text">Nuevo Conductor</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-item">
          <div className="stat-number">{drivers.length}</div>
          <div className="stat-label">Total de Conductores</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{drivers.filter(d => d.phone).length}</div>
          <div className="stat-label">Con Teléfono</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{drivers.filter(d => d.license_number).length}</div>
          <div className="stat-label">Con Licencia</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{driversFiltrados.length}</div>
          <div className="stat-label">Resultados Búsqueda</div>
        </div>
      </div>

      {/* Search */}
      <div className="search-filters-section">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Buscar por nombre, teléfono o licencia..."
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
              <h3>Crear Nuevo Conductor</h3>
              <button 
                className="modal-close"
                onClick={() => setShowFormCreate(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={createDriver} className="form-group">
              <div className="form-field">
                <label>Nombre Completo</label>
                <input 
                  type="text"
                  placeholder="Ej: Juan Pérez García"
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-field">
                <label>Teléfono</label>
                <input 
                  type="tel"
                  placeholder="+57 300 123 4567"
                  value={form.phone} 
                  onChange={e => setForm({...form, phone: e.target.value})} 
                />
              </div>
              <div className="form-field">
                <label>Número de Licencia</label>
                <input 
                  type="text"
                  placeholder="Ej: 1234567890AB"
                  value={form.license_number} 
                  onChange={e => setForm({...form, license_number: e.target.value})} 
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowFormCreate(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-success">
                  Crear Conductor
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
              <h3>Editar Conductor</h3>
              <button 
                className="modal-close"
                onClick={() => setShowFormEdit(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={editarDriver} className="form-group">
              <div className="form-field">
                <label>Nombre Completo</label>
                <input 
                  type="text"
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-field">
                <label>Teléfono</label>
                <input 
                  type="tel"
                  value={editForm.phone} 
                  onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                />
              </div>
              <div className="form-field">
                <label>Número de Licencia</label>
                <input 
                  type="text"
                  value={editForm.license_number} 
                  onChange={e => setEditForm({...editForm, license_number: e.target.value})} 
                />
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
          <p>Cargando conductores...</p>
        </div>
      ) : driversFiltrados.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🚚</span>
          <h3>No hay conductores</h3>
          <p>No se encontraron conductores con los filtros seleccionados</p>
        </div>
      ) : (
        <div className="drivers-grid">
          {driversFiltrados.map((driver) => (
            <div key={driver.id} className="driver-card">
              <div className="card-header">
                <div className="driver-avatar">
                  <span className="avatar-icon">👤</span>
                </div>
                <div className="card-badge">ID #{driver.id}</div>
              </div>

              <div className="card-body">
                <h3 className="driver-name">{driver.name}</h3>
                
                <div className="driver-detail">
                  <span className="detail-icon">📱</span>
                  <div className="detail-content">
                    <span className="detail-label">Teléfono</span>
                    <a href={`tel:${driver.phone}`} className="detail-value phone-link">
                      {driver.phone || '—'}
                    </a>
                  </div>
                </div>

                <div className="driver-detail">
                  <span className="detail-icon">🎫</span>
                  <div className="detail-content">
                    <span className="detail-label">Licencia</span>
                    <span className="detail-value license-code">
                      {driver.license_number || 'No especificada'}
                    </span>
                  </div>
                </div>

                <div className="driver-detail">
                  <span className="detail-icon">📅</span>
                  <div className="detail-content">
                    <span className="detail-label">Registrado</span>
                    <span className="detail-value">
                      {driver.created_at ? new Date(driver.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <button
                  onClick={() => abrirEditar(driver)}
                  className="action-btn edit-btn"
                  title="Editar conductor"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => eliminarDriver(driver.id)}
                  className="action-btn delete-btn"
                  title="Eliminar conductor"
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