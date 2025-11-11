import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../db/connection.js';

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch('https://logisticpro.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // Guarda el token y el rol en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);

      // Redirige al dashboard
      window.location.href = '/dashboard';
    } else {
      alert(data.message || 'Error en el login');
    }
  } catch (error) {
    console.error(error);
    alert('Error al conectar con el servidor');
  }
};
export default handleLogin;