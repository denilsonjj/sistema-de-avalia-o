
import axios from 'axios';

// URL do seu backend no Render
const RENDER_BACKEND_URL = 'https://sistema-de-avalia-o.onrender.com/api'; //exposto para testar não sou burro

console.log(`Conectando à API em: ${RENDER_BACKEND_URL}`);

const api = axios.create({
  baseURL: RENDER_BACKEND_URL,
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