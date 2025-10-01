import axios from 'axios';

// Pega a URL da variável de ambiente.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Log para depuração: Isso aparecerá no console do seu navegador.
console.log(`API baseURL está configurada para: ${baseURL}`);

const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;