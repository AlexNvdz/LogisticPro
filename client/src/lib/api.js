// client/src/lib/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://logisticpro.onrender.com';

// Creamos el "cliente" de axios
const apiClient = axios.create({
  baseURL: API_URL,
});

// ESTA ES LA MAGIA: El "Interceptor"
apiClient.interceptors.request.use(
  (config) => {
    // 1. Antes de que cualquier petición se envíe...
    const token = localStorage.getItem('token');
    
    // 2. Si hay un token, añádelo a las cabeceras
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Maneja errores de la petición
    return Promise.reject(error);
  }
);

export default apiClient;