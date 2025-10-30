// client/src/pages/envios.jsx
const API = import.meta.env.VITE_API_URL || 'https://logisticpro.onrender.com';

import './envios.css';
import React, { useEffect, useState } from 'react';

export default function Envios() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ tracking_code: '', client_id: '', origin: '', destination: '', weight: '' });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [oRes, cRes] = await Promise.all([
        fetch(`${API}/orders`),
        fetch(`${API}/clients`)
      ]);
      const oData = await oRes.json();
      const cData = await cRes.json();
      setOrders(Array.isArray(oData) ? oData : []);
      setClients(Array.isArray(cData) ? cData : []);
    } catch (err) {
      console.error('fetchAll', err);
      alert('Error trayendo envíos o clientes');
    } finally { setLoading(false); }
  }

  async function createOrder(e) {
    e.preventDefault();
    try {
      const payload = { ...form, client_id: Number(form.client_id), weight: Number(form.weight || 0) };
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      setOrders(prev => [created, ...prev]);
      setForm({ tracking_code: '', client_id: '', origin: '', destination: '', weight: '' });
      window.dispatchEvent(new CustomEvent('logistic:data-changed', { detail: { resource: 'orders', id: created.id } }));
    } catch (err) {
      console.error('createOrder', err);
      alert('Error creando orden');
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Envíos</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <form onSubmit={createOrder} className="space-y-3 bg-white p-4 rounded shadow">
          <h3 className="font-medium">Nuevo envío</h3>
          <input className="w-full p-2 border rounded" placeholder="Tracking code" value={form.tracking_code} onChange={e=>setForm({...form,tracking_code:e.target.value})} required />
          <select className="w-full p-2 border rounded" value={form.client_id} onChange={e=>setForm({...form,client_id:e.target.value})} required>
            <option value="">Selecciona cliente</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="w-full p-2 border rounded" placeholder="Origen" value={form.origin} onChange={e=>setForm({...form,origin:e.target.value})} required />
          <input className="w-full p-2 border rounded" placeholder="Destino" value={form.destination} onChange={e=>setForm({...form,destination:e.target.value})} required />
          <input type="number" className="w-full p-2 border rounded" placeholder="Peso" value={form.weight} onChange={e=>setForm({...form,weight:e.target.value})} />
          <div className="text-right">
            <button className="px-4 py-2 bg-green-600 text-white rounded">Crear envío</button>
          </div>
        </form>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium">Lista de envíos</h3>
          {loading ? <div>Cargando...</div> : (
            <div className="mt-3 space-y-2">
              {orders.length === 0 && <div className="text-sm text-gray-500">No hay envíos aún</div>}
              {orders.map(o => (
                <div key={o.id} className="p-3 border rounded">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{o.tracking_code} <span className="text-xs text-gray-400">#{o.id}</span></div>
                      <div className="text-sm text-gray-600">{o.origin} → {o.destination}</div>
                      <div className="text-sm text-gray-500 mt-1">Cliente: {o.client_name || o.client_id}</div>
                    </div>
                    <div className="text-xs text-gray-400">{o.assigned_vehicle_id ? `Vehículo ${o.assigned_vehicle_id}` : 'Sin asignar'}</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">Creado: {o.created_at ? new Date(o.created_at).toLocaleString() : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
