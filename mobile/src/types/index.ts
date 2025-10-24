/**
 * Tipos TypeScript para la aplicación.
 * 
 * Define las interfaces para:
 * - Usuario y autenticación
 * - Tareas
 * - Respuestas de API
 */

export const TaskStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed"
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3
} as const;

export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  category?: string;
  status: TaskStatus;
  priority: TaskPriority;
  is_completed: boolean;
  due_date?: string;
  completed_at?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  category?: string;
  priority?: TaskPriority;
  due_date?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  category?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
}

export interface TaskListResponse {
  items: Task[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  is_completed?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  order?: "asc" | "desc";
}
