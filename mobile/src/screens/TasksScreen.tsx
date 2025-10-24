/**
 * Pantalla de Tareas para móvil.
 */

import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, TextInput } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { tasksApi } from '../api/tasks';
import { TaskPriority, TaskStatus } from '../types';
import type { TaskFilters, Task, TaskUpdate, TaskCreate } from '../types';
import { useAuthStore } from '../store/authStore';
import { handleApiError } from '../utils/errorHandler';
import { useAlert } from '../hooks/useAlert';

import Card from '../components/Card';
import Alert from '../components/Alert';
import TaskFormModal, { TaskFormData } from '../components/TaskFormModal';

export default function TasksScreen() {
  const [filters, setFilters] = useState<TaskFilters>({ page: 1, page_size: 20 });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const { alert, showAlert, hideAlert } = useAlert();

  // Construir filtros dinámicos
  const activeFilters: TaskFilters = {
    ...filters,
    ...(searchQuery && { search: searchQuery }),
    ...(statusFilter && { status: statusFilter }),
    ...(priorityFilter !== undefined && { priority: priorityFilter }),
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tasks', activeFilters],
    queryFn: () => tasksApi.getTasks(activeFilters),
  });

  const deleteMutation = useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showAlert('success', 'Tarea eliminada');
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

  const createMutation = useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsModalVisible(false);
      showAlert('success', 'Tarea creada exitosamente');
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      showAlert('error', apiError.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdate }) => 
      tasksApi.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingTask(null);
      setIsModalVisible(false);
      showAlert('success', 'Tarea actualizada exitosamente');
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      showAlert('error', apiError.message);
    },
  });

  const handleCreateTask = (data: TaskFormData) => {
    console.log('🎯 handleCreateTask llamado con:', data);
    const taskData: TaskCreate = {
      ...data,
      priority: data.priority as TaskPriority,
    };
    console.log('📤 Enviando tarea:', taskData);
    createMutation.mutate(taskData);
  };

  const handleUpdateTask = (data: TaskFormData) => {
    if (!editingTask) return;
    console.log('✏️ handleUpdateTask llamado con:', data);
    const taskData: TaskUpdate = {
      ...data,
      priority: data.priority as TaskPriority,
    };
    console.log('📤 Actualizando tarea:', editingTask.id, taskData);
    updateMutation.mutate({ id: editingTask.id, data: taskData });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingTask(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter(undefined);
    setPriorityFilter(undefined);
  };

  const getPriorityLabel = (priority: number): string => {
    if (priority === TaskPriority.HIGH) return 'Alta';
    if (priority === TaskPriority.MEDIUM) return 'Media';
    return 'Baja';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      in_progress: 'En Progreso',
      completed: 'Completada',
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: number): string => {
    if (priority === TaskPriority.HIGH) return '#FEE2E2';
    if (priority === TaskPriority.MEDIUM) return '#FEF3C7';
    return '#DCFCE7';
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Mis Tareas</Text>
          <Text style={styles.headerSubtitle}>
            {data?.total || 0} {data?.total === 1 ? 'tarea' : 'tareas'}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => setShowFilters(!showFilters)} 
          style={styles.filterButton}
        >
          <Ionicons 
            name={showFilters ? "funnel" : "funnel-outline"} 
            size={24} 
            color={showFilters ? "#ED1C24" : "#6B7280"} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Búsqueda */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar tareas..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Filtro de Estado */}
          <Text style={styles.filterLabel}>Estado</Text>
          <View style={styles.filterChips}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                !statusFilter && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(undefined)}
            >
              <Text style={styles.filterChipText}>Todas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                statusFilter === TaskStatus.PENDING && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(TaskStatus.PENDING)}
            >
              <Text style={styles.filterChipText}>Pendiente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                statusFilter === TaskStatus.IN_PROGRESS && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(TaskStatus.IN_PROGRESS)}
            >
              <Text style={styles.filterChipText}>En Progreso</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                statusFilter === TaskStatus.COMPLETED && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(TaskStatus.COMPLETED)}
            >
              <Text style={styles.filterChipText}>Completada</Text>
            </TouchableOpacity>
          </View>

          {/* Filtro de Prioridad */}
          <Text style={styles.filterLabel}>Prioridad</Text>
          <View style={styles.filterChips}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                priorityFilter === undefined && styles.filterChipActive,
              ]}
              onPress={() => setPriorityFilter(undefined)}
            >
              <Text style={styles.filterChipText}>Todas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                priorityFilter === TaskPriority.LOW && styles.filterChipActive,
              ]}
              onPress={() => setPriorityFilter(TaskPriority.LOW)}
            >
              <Text style={styles.filterChipText}>Baja</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                priorityFilter === TaskPriority.MEDIUM && styles.filterChipActive,
              ]}
              onPress={() => setPriorityFilter(TaskPriority.MEDIUM)}
            >
              <Text style={styles.filterChipText}>Media</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                priorityFilter === TaskPriority.HIGH && styles.filterChipActive,
              ]}
              onPress={() => setPriorityFilter(TaskPriority.HIGH)}
            >
              <Text style={styles.filterChipText}>Alta</Text>
            </TouchableOpacity>
          </View>

          {/* Botón limpiar filtros */}
          {(searchQuery || statusFilter || priorityFilter !== undefined) && (
            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Alertas */}
      {alert.visible && (
        <View style={styles.alertContainer}>
          <Alert type={alert.type} message={alert.message} onClose={hideAlert} />
        </View>
      )}

      {/* Lista de tareas */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
      >
        {isLoading && data === undefined ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando tareas...</Text>
          </View>
        ) : data?.items.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="clipboard-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No hay tareas</Text>
          </Card>
        ) : (
          <View style={styles.tasksList}>
            {data?.items.map((task) => (
              <Card key={task.id} style={[styles.taskCard, task.is_completed && styles.taskCardCompleted]}>
                <View style={styles.taskHeader}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.is_completed && styles.taskTitleCompleted,
                    ]}
                    numberOfLines={2}
                  >
                    {task.title}
                  </Text>
                  <View style={styles.taskActions}>
                    <TouchableOpacity
                      onPress={() => handleEditTask(task)}
                      style={styles.editButton}
                    >
                      <Ionicons name="create-outline" size={20} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteMutation.mutate(task.id)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {task.description && (
                  <Text style={styles.taskDescription} numberOfLines={2}>
                    {task.description}
                  </Text>
                )}

                {/* Badges */}
                <View style={styles.badgesContainer}>
                  {/* Estado */}
                  {task.is_completed ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{getStatusLabel(task.status)}</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        const nextStatus =
                          task.status === TaskStatus.PENDING
                            ? TaskStatus.IN_PROGRESS
                            : task.status === TaskStatus.IN_PROGRESS
                              ? TaskStatus.COMPLETED
                              : TaskStatus.PENDING;
                        updateStatusMutation.mutate({ id: task.id, status: nextStatus });
                      }}
                      style={styles.badge}
                    >
                      <Text style={styles.badgeText}>{getStatusLabel(task.status)}</Text>
                    </TouchableOpacity>
                  )}

                  {/* Prioridad */}
                  <View style={[styles.badge, { backgroundColor: getPriorityColor(task.priority) }]}>
                    <Text style={styles.badgeText}>{getPriorityLabel(task.priority)}</Text>
                  </View>

                  {/* Categoría */}
                  {task.category && (
                    <View style={styles.badgeCategory}>
                      <Text style={styles.badgeText}>{task.category}</Text>
                    </View>
                  )}
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Botón flotante para crear tarea */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal de crear/editar tarea */}
      <TaskFormModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        isLoading={editingTask ? updateMutation.isPending : createMutation.isPending}
        mode={editingTask ? 'edit' : 'create'}
        initialData={editingTask || undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterButton: {
    padding: 8,
    marginRight: 8,
  },
  logoutButton: {
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    borderColor: '#ED1C24',
    backgroundColor: '#FEE2E2',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  clearFiltersButton: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ED1C24',
  },
  alertContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    color: '#6B7280',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#6B7280',
    marginTop: 16,
  },
  tasksList: {
    gap: 16,
  },
  taskCard: {
    marginBottom: 16,
  },
  taskCardCompleted: {
    opacity: 0.7,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
  },
  badgeCategory: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ED1C24',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
