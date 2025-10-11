import { useState } from 'react';
import './almacenes.css';

export default function Almacenes() {
  const [almacenes] = useState([
    {
      id: 'A-01',
      nombre: 'Central Norte',
      ciudad: 'Bogotá',
      capacidad: 85,
      responsable: 'Laura Pérez',
      estado: 'activo'
    },
    {
      id: 'A-02',
      nombre: 'Sur Central',
      ciudad: 'Medellín',
      capacidad: 65,
      responsable: 'Carlos Ruiz',
      estado: 'activo'
    },
    {
      id: 'A-03',
      nombre: 'Este Principal',
      ciudad: 'Bogotá',
      capacidad: 45,
      responsable: 'Ana Gómez',
      estado: 'inactivo'
    },
    {
      id: 'A-04',
      nombre: 'Oeste Secundario',
      ciudad: 'Medellín',
      capacidad: 90,
      responsable: 'Pedro Díaz',
      estado: 'activo'
    }
  ]);

  return (
    <div className="almacenes-container">
      <div className="almacenes-header">
        <div className="header-left">
          <h1>Gestión de Almacenes</h1>
          <span className="almacenes-count">{almacenes.length} almacenes</span>
        </div>
        <button className="btn-primary">
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
          />
        </div>
        <div className="filters">
          <select className="filter-select">
            <option value="">Todas las ciudades</option>
            <option value="bogota">Bogotá</option>
            <option value="medellin">Medellín</option>
          </select>
          <select className="filter-select">
            <option value="">Estado</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
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
              {almacenes.map((almacen) => (
                <tr key={almacen.id}>
                  <td>{almacen.id}</td>
                  <td>{almacen.nombre}</td>
                  <td>{almacen.ciudad}</td>
                  <td>
                    <div className="capacity-bar">
                      <div 
                        className="capacity-fill" 
                        style={{width: `${almacen.capacidad}%`}}
                      ></div>
                      <span>{almacen.capacidad}%</span>
                    </div>
                  </td>
                  <td>{almacen.responsable}</td>
                  <td>
                    <span className={`status-badge ${almacen.estado}`}>
                      {almacen.estado}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="action-btn edit" title="Editar">
                        ✏️
                      </button>
                      <button className="action-btn delete" title="Eliminar">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}