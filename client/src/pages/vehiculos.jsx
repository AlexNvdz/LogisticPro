// client/src/pages/vehiculos.jsx
import React, { useEffect, useState } from 'react';

export default function Vehiculos() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ plate: '', model: '', capacity: '' });

  useEffect(() => { fetchVehicles(); }, []);

  async function fetchVehicles() {
    setLoading(true);
    try {
      const res = await fetch('/vehicles');
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchVehicles', err);
      alert('Error trayendo vehículos');
    } finally { setLoading(false); }
  }

  async function createVehicle(e) {
    e.preventDefault();
    try {
      const res = await fetch('/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plate: form.plate, model: form.model, capacity: Number(form.capacity || 0) })
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      setVehicles(prev => [created, ...prev]);
      setForm({ plate: '', model: '', capacity: '' });
    } catch (err) {
      console.error('createVehicle', err);
      alert('Error creando vehículo');
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Vehículos</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <form onSubmit={createVehicle} className="space-y-3 bg-white p-4 rounded shadow">
          <h3 className="font-medium">Agregar vehículo</h3>
          <input className="w-full p-2 border rounded" placeholder="Placa" value={form.plate} onChange={e=>setForm({...form,plate:e.target.value})} required />
          <input className="w-full p-2 border rounded" placeholder="Modelo" value={form.model} onChange={e=>setForm({...form,model:e.target.value})} />
          <input type="number" className="w-full p-2 border rounded" placeholder="Capacidad" value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})} />
          <div className="text-right">
            <button className="px-4 py-2 bg-green-600 text-white rounded">Crear vehículo</button>
          </div>
        </form>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium">Lista de vehículos</h3>
          {loading ? <div>Cargando...</div> : (
            <div className="mt-3 space-y-2">
              {vehicles.length === 0 && <div className="text-sm text-gray-500">No hay vehículos aún</div>}
              {vehicles.map(v => (
                <div key={v.id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{v.plate} <span className="text-sm text-gray-500">{v.model}</span></div>
                    <div className="text-sm text-gray-600">Capacidad: {v.capacity}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${v.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>{v.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
