/**
 * Servicio de autenticación.
 * 
 * Maneja todas las operaciones relacionadas con auth:
 * - Login
 * - Register
 * - Logout
 * - Obtener usuario actual
 */

import api from './client';
import type { LoginCredentials, RegisterData, AuthTokens, User } from '../types';

export const authApi = {
  /**
   * Inicia sesión con credenciales.
   */
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Registra un nuevo usuario.
   */
  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  /**
   * Obtiene el perfil del usuario actual.
   */
  me: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Cierra sesión (limpia tokens locales).
   */
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
