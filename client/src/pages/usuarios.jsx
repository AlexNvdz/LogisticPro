// client/src/pages/usuarios.jsx
const API = import.meta.env.VITE_API_URL || 'https://logisticpro.onrender.com';

import './styles/usuarios.css';
import React, { useEffect, useState } from 'react';

export default function Usuarios() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', contact_email: '', contact_phone: '', address: '' });

  useEffect(() => { fetchClients(); }, []);

  async function fetchClients() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/clients`);
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchClients', err);
      alert('Error trayendo clientes');
    } finally { setLoading(false); }
  }

  async function createClient(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      setClients(prev => [created, ...prev]);
      setForm({ name: '', contact_email: '', contact_phone: '', address: '' });
      window.dispatchEvent(new CustomEvent('logistic:data-changed', { detail: { resource: 'clients', id: created.id } }));
    } catch (err) {
      console.error('createClient', err);
      alert('Error creando cliente');
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Clientes</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <form onSubmit={createClient} className="space-y-3 bg-white p-4 rounded shadow">
          <h3 className="font-medium">Crear cliente</h3>
          <input className="w-full p-2 border rounded" placeholder="Nombre" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
          <input className="w-full p-2 border rounded" placeholder="Email" value={form.contact_email} onChange={e=>setForm({...form,contact_email:e.target.value})} />
          <input className="w-full p-2 border rounded" placeholder="Teléfono" value={form.contact_phone} onChange={e=>setForm({...form,contact_phone:e.target.value})} />
          <textarea className="w-full p-2 border rounded" placeholder="Dirección" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} />
          <div className="text-right">
            <button className="px-4 py-2 bg-green-600 text-white rounded">Crear</button>
          </div>
        </form>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium">Lista de clientes</h3>
          {loading ? <div className="mt-4">Cargando...</div> : (
            <div className="mt-3 space-y-2">
              {clients.length === 0 && <div className="text-sm text-gray-500">No hay clientes aún</div>}
              {clients.map(c => (
                <div key={c.id} className="p-3 border rounded flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{c.name} <span className="text-xs text-gray-400">#{c.id}</span></div>
                    <div className="text-sm text-gray-600">{c.contact_email || c.email} • {c.contact_phone}</div>
                    <div className="text-xs text-gray-400 mt-1">{c.address}</div>
                  </div>
                  <div className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
