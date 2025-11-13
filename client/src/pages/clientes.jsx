import { useState, useEffect } from 'react';
import apiClient from '../lib/api';
import '../styles/clientes.css';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFormCreate, setShowFormCreate] = useState(false);
  const [showFormEdit, setShowFormEdit] = useState(false);
  const [form, setForm] = useState({ name: '', contact_email: '', contact_phone: '', address: '' });
  const [editForm, setEditForm] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    setLoading(true);
    try {
      const res = await apiClient.get('/clients');
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error cargando clientes:', err);
    } finally {
      setLoading(false);
    }
  }

  async function crearCliente(e) {
    e.preventDefault();
    try {
      const res = await apiClient.post('/clients', form);
      const nuevo = res.data;
      setClientes(prev => [nuevo, ...prev]);
      setForm({ name: '', contact_email: '', contact_phone: '', address: '' });
      setShowFormCreate(false);
      window.dispatchEvent(new CustomEvent('logistic:data-changed', { detail: { resource: 'clients', id: nuevo.id } }));
    } catch (err) {
      console.error('Error creando cliente:', err);
      if (err.response?.status === 403) {
        alert('No tienes permiso para crear clientes. Solo los administradores pueden.');
      } else {
        alert('Error creando cliente.');
      }
    }
  }

  function abrirEditar(cliente) {
    setEditForm({ ...cliente });
    setShowFormEdit(true);
  }

  async function editarCliente(e) {
    e.preventDefault();
    try {
      const payload = {
        name: editForm.name,
        contact_email: editForm.contact_email,
        contact_phone: editForm.contact_phone,
        address: editForm.address
      };
      const res = await apiClient.put(`/clients/${editForm.id}`, payload);
      const actualizado = res.data;
      setClientes(prev => prev.map(c => c.id === actualizado.id ? actualizado : c));
      setEditForm(null);
      setShowFormEdit(false);
    } catch (err) {
      console.error('Error editando cliente:', err);
      if (err.response?.status === 403) {
        alert('No tienes permiso para editar clientes. Solo los administradores pueden.');
      } else {
        alert('Error editando cliente.');
      }
    }
  }

  async function eliminarCliente(id) {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) return;
    try {
      await apiClient.delete(`/clients/${id}`);
      setClientes(prev => prev.filter(c => c.id !== id));
      window.dispatchEvent(new CustomEvent('logistic:data-changed', { detail: { resource: 'clients', action: 'delete' } }));
    } catch (err) {
      console.error('Error eliminando cliente:', err);
      if (err.response?.status === 403) {
        alert('No tienes permiso para eliminar clientes. Solo los administradores pueden.');
      } else {
        alert('Error eliminando cliente.');
      }
    }
  }

  // Filtros y búsqueda
  const clientesFiltrados = clientes.filter(c => {
    const busquedaOk = !busqueda || 
      c.name?.toLowerCase().includes(busqueda.toLowerCase()) || 
      c.contact_email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.address?.toLowerCase().includes(busqueda.toLowerCase());
    return busquedaOk;
  });

  return (
    <div className="clientes-container">
      {/* Header Section */}
      <div className="clientes-header">
        <div className="header-left">
          <h1 className="page-title">Gestión de Clientes</h1>
          <p className="page-subtitle">Administra y mantén contacto con tus clientes</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowFormCreate(true)}
        >
          <span className="btn-icon">+</span>
          <span className="btn-text">Nuevo Cliente</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-item">
          <div className="stat-number">{clientes.length}</div>
          <div className="stat-label">Total de Clientes</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{clientes.filter(c => c.contact_email).length}</div>
          <div className="stat-label">Con Email</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{clientes.filter(c => c.contact_phone).length}</div>
          <div className="stat-label">Con Teléfono</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{clientesFiltrados.length}</div>
          <div className="stat-label">Resultados Búsqueda</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o dirección..."
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
              <h3>Crear Nuevo Cliente</h3>
              <button 
                className="modal-close"
                onClick={() => setShowFormCreate(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={crearCliente} className="form-group">
              <div className="form-field">
                <label>Nombre del Cliente</label>
                <input 
                  type="text"
                  placeholder="Ej: Transportes ABC"
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input 
                  type="email"
                  placeholder="contacto@empresa.com"
                  value={form.contact_email} 
                  onChange={e => setForm({...form, contact_email: e.target.value})} 
                />
              </div>
              <div className="form-field">
                <label>Teléfono</label>
                <input 
                  type="tel"
                  placeholder="+57 300 123 4567"
                  value={form.contact_phone} 
                  onChange={e => setForm({...form, contact_phone: e.target.value})} 
                />
              </div>
              <div className="form-field">
                <label>Dirección</label>
                <input 
                  type="text"
                  placeholder="Calle 123 #45-67"
                  value={form.address} 
                  onChange={e => setForm({...form, address: e.target.value})} 
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowFormCreate(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-success">
                  Crear Cliente
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
              <h3>Editar Cliente</h3>
              <button 
                className="modal-close"
                onClick={() => setShowFormEdit(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={editarCliente} className="form-group">
              <div className="form-field">
                <label>Nombre del Cliente</label>
                <input 
                  type="text"
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input 
                  type="email"
                  value={editForm.contact_email} 
                  onChange={e => setEditForm({...editForm, contact_email: e.target.value})} 
                />
              </div>
              <div className="form-field">
                <label>Teléfono</label>
                <input 
                  type="tel"
                  value={editForm.contact_phone} 
                  onChange={e => setEditForm({...editForm, contact_phone: e.target.value})} 
                />
              </div>
              <div className="form-field">
                <label>Dirección</label>
                <input 
                  type="text"
                  value={editForm.address} 
                  onChange={e => setEditForm({...editForm, address: e.target.value})} 
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

      {/* Table Section */}
      <div className="table-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando clientes...</p>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">👥</span>
            <h3>No hay clientes</h3>
            <p>No se encontraron clientes con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="table-row">
                    <td className="cell-id">
                      <span className="id-badge">{cliente.id}</span>
                    </td>
                    <td className="cell-name">
                      <span className="client-icon">👤</span>
                      {cliente.name}
                    </td>
                    <td className="cell-email">
                      <a href={`mailto:${cliente.contact_email}`} className="email-link">
                        {cliente.contact_email || '—'}
                      </a>
                    </td>
                    <td className="cell-phone">
                      <a href={`tel:${cliente.contact_phone}`} className="phone-link">
                        {cliente.contact_phone || '—'}
                      </a>
                    </td>
                    <td className="cell-address">
                      <span className="address-text">
                        📍 {cliente.address || 'No especificada'}
                      </span>
                    </td>
                    <td className="cell-actions">
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => abrirEditar(cliente)}
                          title="Editar cliente"
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => eliminarCliente(cliente.id)}
                          title="Eliminar cliente"
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