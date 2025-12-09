/**
 * Cliente HTTP configurado con Axios.
 * 
 * Funcionalidades:
 * - Base URL del backend
 * - Interceptores para JWT tokens
 * - Refresh automático de tokens
 * - Manejo de errores HTTP
 */

import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Crear instancia de axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a todas las requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    throw error;
  }
);

// Interceptor para manejar respuestas y refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si el token expiró (401) y no hemos intentado refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Intentar refresh
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        // Reintentar request original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla, limpiar tokens y redirigir a login
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        globalThis.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    throw error;
  }
);

export default api;
