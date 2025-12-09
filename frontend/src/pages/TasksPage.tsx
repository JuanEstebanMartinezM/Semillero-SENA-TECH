/**
 * Página principal de Tareas.
 * 
 * Muestra lista de tareas con:
 * - Filtros (status, priority, search)
 * - Paginación
 * - Crear nueva tarea con modal fijo
 * - Editar/eliminar tareas
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiLogOut, FiTrash2, FiCheck } from 'react-icons/fi';
import { tasksApi } from '../api/tasks';
import { TaskPriority, TaskStatus } from '../types';
import type { TaskFilters, TaskCreate } from '../types';
import { useAuthStore } from '../store/authStore';
import { handleApiError } from '../utils/errorHandler';
import { useAlert } from '../hooks/useAlert';

// Componentes
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Alert from '../components/ui/Alert';

// Helper para obtener label de prioridad
const getPriorityLabel = (priority: TaskPriority): string => {
  if (priority === TaskPriority.HIGH) return 'Alta';
  if (priority === TaskPriority.MEDIUM) return 'Media';
  return 'Baja';
};

// Helper para obtener label de estado
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    in_progress: 'En Progreso',
    completed: 'Completada',
  };
  return labels[status] || status;
};

// Helper para obtener clase de color de prioridad
const getPriorityColorClass = (priority: TaskPriority): string => {
  if (priority === TaskPriority.HIGH) return 'bg-red-100 text-red-800';
  if (priority === TaskPriority.MEDIUM) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
};

export default function TasksPage() {
  const [filters, setFilters] = useState<TaskFilters>({ page: 1, page_size: 10 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const { alert, showAlert, hideAlert } = useAlert();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksApi.getTasks(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showAlert('success', 'Tarea eliminada correctamente');
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      showAlert('error', apiError.message);
    },
  });

  const completeMutation = useMutation({
    mutationFn: tasksApi.completeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showAlert('success', 'Tarea completada');
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      showAlert('error', apiError.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => tasksApi.updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showAlert('success', 'Estado actualizado');
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      showAlert('error', apiError.message);
    },
  });

  const handleLogout = () => {
    logout();
    globalThis.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src="/davivienda.png" alt="Davivienda" className="h-16 w-auto" />
            <h1 className="text-3xl font-bold text-gray-900">Mis Tareas</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => setShowCreateModal(true)} variant="primary">
              <FiPlus className="w-5 h-5 inline mr-2" />
              Nueva Tarea
            </Button>
            <Button onClick={handleLogout} variant="danger">
              <FiLogOut className="w-5 h-5 inline mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Alertas */}
        {alert.visible && (
          <div className="mb-6">
            <Alert type={alert.type} message={alert.message} onClose={hideAlert} />
          </div>
        )}

        {/* Filtros */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Buscar"
              type="text"
              placeholder="Buscar tareas..."
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />

            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="status-filter"
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status_filter: e.target.value ? (e.target.value as typeof TaskStatus[keyof typeof TaskStatus]) : undefined,
                    page: 1,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-davivienda-red focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value={TaskStatus.PENDING}>Pendiente</option>
                <option value={TaskStatus.IN_PROGRESS}>En Progreso</option>
                <option value={TaskStatus.COMPLETED}>Completada</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select
                id="priority-filter"
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    priority: e.target.value ? (Number(e.target.value) as TaskPriority) : undefined,
                    page: 1,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-davivienda-red focus:border-transparent"
              >
                <option value="">Todas las prioridades</option>
                <option value={TaskPriority.HIGH}>Alta</option>
                <option value={TaskPriority.MEDIUM}>Media</option>
                <option value={TaskPriority.LOW}>Baja</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Lista de tareas */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-davivienda-red border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">Cargando tareas...</p>
          </div>
        ) : (
          <>
            {data?.items.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500">No hay tareas para mostrar</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {data?.items.map((task) => (
                  <Card key={task.id} className={task.is_completed ? 'opacity-70' : ''}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-lg font-medium ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-2">{task.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3 items-center">
                          {/* Dropdown para cambiar estado */}
                          {!task.is_completed && (
                            <select
                              value={task.status}
                              onChange={(e) =>
                                updateStatusMutation.mutate({ id: task.id, status: e.target.value })
                              }
                              disabled={updateStatusMutation.isPending}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border-none cursor-pointer hover:bg-blue-200 transition-colors"
                            >
                              <option value={TaskStatus.PENDING}>Pendiente</option>
                              <option value={TaskStatus.IN_PROGRESS}>En Progreso</option>
                              <option value={TaskStatus.COMPLETED}>Completada</option>
                            </select>
                          )}
                          {task.is_completed && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {getStatusLabel(task.status)}
                            </span>
                          )}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColorClass(task.priority)}`}
                          >
                            {getPriorityLabel(task.priority)}
                          </span>
                          {task.category && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              {task.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!task.is_completed && (
                          <button
                            onClick={() => completeMutation.mutate(task.id)}
                            disabled={completeMutation.isPending}
                            className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                            title="Completar tarea"
                          >
                            <FiCheck className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteMutation.mutate(task.id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                          title="Eliminar tarea"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Paginación */}
            {data && data.total_pages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-4">
                <Button
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                  disabled={(filters.page || 1) <= 1}
                  variant="secondary"
                >
                  Anterior
                </Button>
                <span className="text-gray-700 font-medium">
                  Página {filters.page || 1} de {data.total_pages}
                </span>
                <Button
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                  disabled={(filters.page || 1) >= data.total_pages}
                  variant="secondary"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}

        {/* Modal para crear tarea */}
        {showCreateModal && (
          <CreateTaskModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['tasks'] });
              showAlert('success', 'Tarea creada correctamente');
            }}
          />
        )}
      </div>
    </div>
  );
}

// Modal para crear tarea
interface CreateTaskModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

function CreateTaskModal({ isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const [formData, setFormData] = useState<TaskCreate>({
    title: '',
    description: '',
    category: '',
    priority: TaskPriority.MEDIUM,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showAlert } = useAlert();

  const createMutation = useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => {
      onSuccess();
      onClose();
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: TaskPriority.MEDIUM,
      });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      showAlert('error', apiError.message);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (formData.title.length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    createMutation.mutate(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Tarea" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Título"
          type="text"
          value={formData.title}
          onChange={(e) => {
            setFormData({ ...formData, title: e.target.value });
            if (errors.title) setErrors({ ...errors, title: '' });
          }}
          error={errors.title}
          placeholder="Título de la tarea"
          required
          disabled={createMutation.isPending}
        />

        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="task-description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-davivienda-red focus:border-transparent"
            placeholder="Descripción de la tarea"
            disabled={createMutation.isPending}
          />
        </div>

        <Input
          label="Categoría"
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="Ej: Trabajo, Personal, Estudio"
          disabled={createMutation.isPending}
        />

        <div>
          <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-1">
            Prioridad
          </label>
          <select
            id="task-priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) as TaskPriority })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-davivienda-red focus:border-transparent"
            disabled={createMutation.isPending}
          >
            <option value={TaskPriority.HIGH}>Alta</option>
            <option value={TaskPriority.MEDIUM}>Media</option>
            <option value={TaskPriority.LOW}>Baja</option>
          </select>
        </div>

        <div>
          <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de vencimiento (opcional)
          </label>
          <input
            id="task-due-date"
            type="date"
            value={formData.due_date || ''}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-davivienda-red focus:border-transparent"
            disabled={createMutation.isPending}
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" onClick={onClose} variant="secondary" disabled={createMutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
            Crear Tarea
          </Button>
        </div>
      </form>
    </Modal>
  );
}
