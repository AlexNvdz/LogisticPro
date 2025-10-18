import { useState, useEffect } from 'react';
import './almacenes.css';

const API = import.meta.env.VITE_API_URL || '';

export default function Almacenes() {
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', capacity: '', manager: '' });
  const [editForm, setEditForm] = useState(null);
  const [filtroCiudad, setFiltroCiudad] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => { fetchAlmacenes(); }, []);

  async function fetchAlmacenes() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/warehouses`);
      const data = await res.json();
      setAlmacenes(Array.isArray(data) ? data : []);
    } catch (err) {
      alert('Error cargando almacenes');
    } finally {
      setLoading(false);
    }
  }

  async function crearAlmacen(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/warehouses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          location: form.location,
          capacity: Number(form.capacity) || 0,
          manager: form.manager
        })
      });
      if (!res.ok) throw new Error(await res.text());
      const nuevo = await res.json();
      setAlmacenes(prev => [nuevo, ...prev]);
      setForm({ name: '', location: '', capacity: '', manager: '' });
      document.getElementById('form-almacen').style.display = 'none';
    } catch (err) {
      alert('Error creando almacén');
    }
  }

  function abrirEditar(almacen) {
    setEditForm({ ...almacen });
    document.getElementById('form-editar-almacen').style.display = 'block';
  }

  async function editarAlmacen(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/warehouses/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          location: editForm.location,
          capacity: Number(editForm.capacity) || 0,
          manager: editForm.manager,
          status: editForm.status || 'activo'
        })
      });
      if (!res.ok) throw new Error(await res.text());
      const actualizado = await res.json();
      setAlmacenes(prev => prev.map(a => a.id === actualizado.id ? actualizado : a));
      setEditForm(null);
      document.getElementById('form-editar-almacen').style.display = 'none';
    } catch (err) {
      alert('Error editando almacén');
    }
  }

  async function eliminarAlmacen(id) {
    if (!window.confirm('¿Eliminar este almacén?')) return;
    try {
      const res = await fetch(`${API}/warehouses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      setAlmacenes(prev => prev.filter(a => a.id !== id));
    } catch (err) {
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

  return (
    <div className="almacenes-container">
      <div className="almacenes-header">
        <div className="header-left">
          <h1>Gestión de Almacenes</h1>
          <span className="almacenes-count">{almacenesFiltrados.length} almacenes</span>
        </div>
        <button 
          className="btn-primary"
          onClick={() => document.getElementById('form-almacen').style.display = 'block'}
        >
          <span className="icon">+</span>
          Nuevo Almacén
        </button>
      </div>

      <div className="search-filters">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Buscar almacén..."
            className="search-input"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <div className="filters">
          <select className="filter-select" value={filtroCiudad} onChange={e => setFiltroCiudad(e.target.value)}>
            <option value="">Todas las ciudades</option>
            {[...new Set(almacenes.map(a => a.location))].map(ciudad => (
              <option key={ciudad} value={ciudad?.toLowerCase()}>{ciudad}</option>
            ))}
          </select>
          <select className="filter-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Estado</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Formulario modal para crear almacén */}
      <div id="form-almacen" style={{display:'none', position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', zIndex:1000}}>
        <div style={{
          background:'#fff', borderRadius:'0.5rem', padding:'2rem', maxWidth:'400px', margin:'5vh auto', position:'relative'
        }}>
          <button 
            style={{position:'absolute', top:10, right:10, background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer'}}
            onClick={() => document.getElementById('form-almacen').style.display = 'none'}
            title="Cerrar"
          >×</button>
          <form onSubmit={crearAlmacen} className="space-y-3">
            <h3 className="font-medium">Nuevo almacén</h3>
            <input className="w-full p-2 border rounded" placeholder="Nombre" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
            <input className="w-full p-2 border rounded" placeholder="Ciudad" value={form.location} onChange={e=>setForm({...form, location:e.target.value})} required />
            <input type="number" className="w-full p-2 border rounded" placeholder="Capacidad (%)" value={form.capacity} onChange={e=>setForm({...form, capacity:e.target.value})} min={0} max={100} />
            <input className="w-full p-2 border rounded" placeholder="Responsable" value={form.manager} onChange={e=>setForm({...form, manager:e.target.value})} />
            <div className="text-right">
              <button className="px-4 py-2 bg-green-600 text-white rounded">Crear almacén</button>
            </div>
          </form>
        </div>
      </div>

      {/* Formulario modal para editar almacén */}
      <div id="form-editar-almacen" style={{display:'none', position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', zIndex:1000}}>
        <div style={{
          background:'#fff', borderRadius:'0.5rem', padding:'2rem', maxWidth:'400px', margin:'5vh auto', position:'relative'
        }}>
          <button 
            style={{position:'absolute', top:10, right:10, background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer'}}
            onClick={() => { setEditForm(null); document.getElementById('form-editar-almacen').style.display = 'none'; }}
            title="Cerrar"
          >×</button>
          {editForm && (
            <form onSubmit={editarAlmacen} className="space-y-3">
              <h3 className="font-medium">Editar almacén</h3>
              <input className="w-full p-2 border rounded" placeholder="Nombre" value={editForm.name} onChange={e=>setEditForm({...editForm, name:e.target.value})} required />
              <input className="w-full p-2 border rounded" placeholder="Ciudad" value={editForm.location} onChange={e=>setEditForm({...editForm, location:e.target.value})} required />
              <input type="number" className="w-full p-2 border rounded" placeholder="Capacidad (%)" value={editForm.capacity} onChange={e=>setEditForm({...editForm, capacity:e.target.value})} min={0} max={100} />
              <input className="w-full p-2 border rounded" placeholder="Responsable" value={editForm.manager} onChange={e=>setEditForm({...editForm, manager:e.target.value})} />
              <select className="w-full p-2 border rounded" value={editForm.status || 'activo'} onChange={e=>setEditForm({...editForm, status:e.target.value})}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
              <div className="text-right">
                <button className="px-4 py-2 bg-blue-600 text-white rounded">Guardar cambios</button>
              </div>
            </form>
          )}
        </div>
      </div>

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
                  <th>Ciudad</th>
                  <th>Capacidad</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {almacenesFiltrados.map((almacen) => (
                  <tr key={almacen.id}>
                    <td>{almacen.id}</td>
                    <td>{almacen.name}</td>
                    <td>{almacen.location}</td>
                    <td>
                      <div className="capacity-bar">
                        <div 
                          className="capacity-fill" 
                          style={{width: `${almacen.capacity || 0}%`}}
                        ></div>
                        <span>{almacen.capacity || 0}%</span>
                      </div>
                    </td>
                    <td>{almacen.manager}</td>
                    <td>
                      <span className={`status-badge ${almacen.status ? almacen.status.toLowerCase() : 'activo'}`}>
                        {almacen.status ? almacen.status : 'activo'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="action-btn edit" title="Editar" onClick={() => abrirEditar(almacen)}>
                          ✏️
                        </button>
                        <button className="action-btn delete" title="Eliminar" onClick={() => eliminarAlmacen(almacen.id)}>
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