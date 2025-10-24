/**
 * Servicio de tareas.
 * 
 * Maneja todas las operaciones CRUD de tareas:
 * - Crear, leer, actualizar, eliminar
 * - Filtrado y paginación
 * - Marcar como completada
 */

import api from './client';
import type { Task, TaskCreate, TaskUpdate, TaskListResponse, TaskFilters } from '../types';

export const tasksApi = {
  /**
   * Obtiene lista de tareas con filtros.
   */
  getTasks: async (filters?: TaskFilters): Promise<TaskListResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      }
    }
    
    const response = await api.get<TaskListResponse>(`/tasks?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtiene una tarea por ID.
   */
  getTask: async (id: number): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva tarea.
   */
  createTask: async (data: TaskCreate): Promise<Task> => {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  /**
   * Actualiza una tarea existente.
   */
  updateTask: async (id: number, data: TaskUpdate): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  /**
   * Elimina una tarea.
   */
  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  /**
   * Marca una tarea como completada.
   */
  completeTask: async (id: number): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${id}/complete`);
    return response.data;
  },

  /**
   * Cambia el estado de una tarea.
   */
  updateTaskStatus: async (id: number, status: string): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${id}`, { status });
    return response.data;
  },
};
