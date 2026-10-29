import axios from 'axios';
import { emitToast } from '../context/ToastContext';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear auth state, show session-expired toast, and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        emitToast('warning', 'Your session has expired. Please sign in again.', 5000);
        setTimeout(() => { window.location.href = '/login'; }, 1200);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
