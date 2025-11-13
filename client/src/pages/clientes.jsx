import { useState, useEffect } from 'react';
import apiClient from '../lib/api';
// (Asegúrate de tener o crear este archivo CSS, puedes copiar el de almacenes)
import '../styles/almacenes.css'; 

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  // Campos del formulario para un Cliente
  const [form, setForm] = useState({ name: '', contact_email: '', contact_phone: '', address: '' });
  const [editForm, setEditForm] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => { fetchClientes(); }, []);

  async function fetchClientes() {
    setLoading(true);
    try {
      const res = await apiClient.get('/clients');
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      alert('Error cargando clientes');
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
      document.getElementById('form-cliente').style.display = 'none';
    } catch (err) {
      console.error("Error creando cliente:", err);
      // --- CAMBIO AQUÍ ---
      if (err.response && err.response.status === 403) {
        alert('No tienes permiso para crear clientes. Solo los administradores pueden.');
      } else {
        alert('Error creando cliente.');
      }
    }
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
      document.getElementById('form-editar-cliente').style.display = 'none';
    } catch (err) {
      console.error("Error editando cliente:", err);
      // --- CAMBIO AQUÍ ---
      if (err.response && err.response.status === 403) {
        alert('No tienes permiso para editar clientes. Solo los administradores pueden.');
      } else {
        alert('Error editando cliente.');
      }
    }
  }

  async function eliminarCliente(id) {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    try {
      await apiClient.delete(`/clients/${id}`);
      setClientes(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error eliminando cliente:", err);
      // --- CAMBIO AQUÍ ---
      if (err.response && err.response.status === 403) {
        alert('No tienes permiso para eliminar clientes. Solo los administradores pueden.');
      } else {
        alert('Error eliminando cliente.');
      }
    }
  }

  // Filtros y búsqueda (simplificado para buscar por nombre, email o dirección)
  const clientesFiltrados = clientes.filter(c => {
    const busquedaOk = !busqueda || 
      c.name?.toLowerCase().includes(busqueda.toLowerCase()) || 
      c.contact_email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.address?.toLowerCase().includes(busqueda.toLowerCase());
    return busquedaOk;
  });

  return (
    // Puedes cambiar 'almacenes-container' si quieres, pero no es necesario si copias el CSS
    <div className="almacenes-container"> 
      <div className="almacenes-header">
        <div className="header-left">
          <h1>Gestión de Clientes</h1>
          <span className="almacenes-count">{clientesFiltrados.length} clientes</span>
        </div>
        <button 
          className="btn-primary"
          onClick={() => document.getElementById('form-cliente').style.display = 'block'}
        >
          <span className="icon">+</span>
          Nuevo Cliente
        </button>
      </div>

      <div className="search-filters">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Buscar cliente..."
            className="search-input"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        {/* Quitamos los filtros de ciudad y estado que no aplican a clientes */}
      </div>

      {/* Formulario modal para crear cliente */}
      <div id="form-cliente" style={{display:'none', position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', zIndex:1000}}>
        <div style={{
          background:'#fff', borderRadius:'0.5rem', padding:'2rem', maxWidth:'400px', margin:'5vh auto', position:'relative'
        }}>
          <button 
            style={{position:'absolute', top:10, right:10, background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer'}}
            onClick={() => document.getElementById('form-cliente').style.display = 'none'}
            title="Cerrar"
          >×</button>
          <form onSubmit={crearCliente} className="space-y-3">
            <h3 className="font-medium">Nuevo cliente</h3>
            <input className="w-full p-2 border rounded" placeholder="Nombre" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
            <input className="w-full p-2 border rounded" placeholder="Email" value={form.contact_email} onChange={e=>setForm({...form, contact_email:e.target.value})} />
            <input className="w-full p-2 border rounded" placeholder="Teléfono" value={form.contact_phone} onChange={e=>setForm({...form, contact_phone:e.target.value})} />
            <input className="w-full p-2 border rounded" placeholder="Dirección" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} />
            <div className="text-right">
              <button className="px-4 py-2 bg-green-600 text-white rounded">Crear cliente</button>
            </div>
          </form>
        </div>
      </div>

      {/* Formulario modal para editar cliente */}
      <div id="form-editar-cliente" style={{display:'none', position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', zIndex:1000}}>
        <div style={{
          background:'#fff', borderRadius:'0.5rem', padding:'2rem', maxWidth:'400px', margin:'5vh auto', position:'relative'
        }}>
          <button 
            style={{position:'absolute', top:10, right:10, background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer'}}
            onClick={() => { setEditForm(null); document.getElementById('form-editar-cliente').style.display = 'none'; }}
            title="Cerrar"
          >×</button>
          {editForm && (
            <form onSubmit={editarCliente} className="space-y-3">
              <h3 className="font-medium">Editar cliente</h3>
              <input className="w-full p-2 border rounded" placeholder="Nombre" value={editForm.name} onChange={e=>setEditForm({...editForm, name:e.target.value})} required />
              <input className="w-full p-2 border rounded" placeholder="Email" value={editForm.contact_email} onChange={e=>setEditForm({...editForm, contact_email:e.target.value})} />
              <input className="w-full p-2 border rounded" placeholder="Teléfono" value={editForm.contact_phone} onChange={e=>setEditForm({...editForm, contact_phone:e.target.value})} />
              <input className="w-full p-2 border rounded" placeholder="Dirección" value={editForm.address} onChange={e=>setEditForm({...editForm, address:e.target.value})} />
              <div className="text-right">
                <button className="px-4 py-2 bg-blue-600 text-white rounded">Guardar cambios</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className="card">
        <div className="table-container">
          {loading ? (
            <div style={{padding:'2rem', textAlign:'center'}}>Cargando...</div>
          ) : (
            <table className="table">
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
                  <tr key={cliente.id}>
                    <td>{cliente.id}</td>
                    <td>{cliente.name}</td>
                    <td>{cliente.contact_email}</td>
                    <td>{cliente.contact_phone}</td>
                    <td>{cliente.address}</td>
                    <td>
                      <div className="actions">
                        <button className="action-btn edit" title="Editar" onClick={() => abrirEditar(cliente)}>
                          ✏️
                        </button>
                        <button className="action-btn delete" title="Eliminar" onClick={() => eliminarCliente(cliente.id)}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}