# 🌐 Davivienda Task Manager - Frontend Web

Aplicación web moderna de gestión de tareas construida con **React 18**, **TypeScript** y **Tailwind CSS**, ofreciendo una experiencia de usuario fluida y responsive.

---

## 📋 Tabla de Contenidos

- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Estructura de Carpetas](#-estructura-de-carpetas)
- [Patrones de Diseño](#-patrones-de-diseño)
- [Convenciones de Código](#-convenciones-de-código)
- [Componentes](#-componentes)
- [State Management](#-state-management)
- [Flujo de Funcionamiento](#-flujo-de-funcionamiento)
- [Instalación](#-instalación)
- [Testing](#-testing)

---

## 🚀 Tecnologías

### Framework y Librería Principal

**React 18.3.1**
- **¿Por qué?**: Librería líder para construir interfaces de usuario
- **Ventajas**:
  - Virtual DOM para renders eficientes
  - Hooks para lógica reutilizable
  - Ecosistema maduro y gran comunidad
  - Concurrent rendering para mejor UX

**TypeScript 5.6.3**
- **¿Por qué?**: Superset de JavaScript con tipos estáticos
- **Ventajas**:
  - Detección de errores en tiempo de desarrollo
  - Autocompletado inteligente en IDE
  - Refactoring más seguro
  - Mejor documentación del código
  - Interfaces para contratos de datos

### Build Tool

**Vite 6.0.1**
- **¿Por qué?**: Build tool de próxima generación
- **Ventajas**:
  - HMR (Hot Module Replacement) ultra-rápido
  - Build optimizado con Rollup
  - Soporte nativo de TypeScript y JSX
  - Configuración mínima

### Estilos

**Tailwind CSS 3.4.15**
- **¿Por qué?**: Framework CSS utility-first
- **Ventajas**:
  - Desarrollo rápido con clases utilitarias
  - Customización completa del diseño
  - Tree-shaking automático (CSS no usado se elimina)
  - Responsive design fácil
  - Dark mode built-in

**PostCSS + Autoprefixer**
- Compatibilidad cross-browser automática
- Optimización de CSS

### Estado y Data Fetching

**TanStack Query 5.62.8** (React Query)
- **¿Por qué?**: Gestión de estado del servidor
- **Ventajas**:
  - Cache automático de peticiones
  - Revalidación en background
  - Optimistic updates
  - Infinite scroll y pagination
  - Retry logic automático

**Zustand 5.0.2**
- **¿Por qué?**: State management minimalista
- **Ventajas**:
  - API simple e intuitiva
  - Menos boilerplate que Redux
  - DevTools integrados
  - TypeScript first-class support

### HTTP Client

**Axios 1.7.9**
- **¿Por qué?**: Cliente HTTP robusto
- **Ventajas**:
  - Interceptors para tokens
  - Transformación automática de respuestas
  - Cancel requests
  - Progress tracking

### Routing

**React Router DOM 7.0.2**
- **¿Por qué?**: Routing declarativo para React
- **Ventajas**:
  - Navegación client-side
  - Protected routes
  - Lazy loading de páginas
  - History API management

### UI Components

**Lucide React 0.469.0**
- **¿Por qué?**: Librería de iconos moderna
- **Ventajas**:
  - Iconos SVG optimizados
  - Tree-shaking (solo importas lo que usas)
  - Customizables con props
  - Más de 1000 iconos

**React Hook Form 7.54.2**
- **¿Por qué?**: Gestión de formularios performante
- **Ventajas**:
  - Re-renders mínimos
  - Validación integrada
  - API simple con hooks
  - TypeScript support

**date-fns 4.1.0**
- Manipulación de fechas ligera
- Modular (tree-shakeable)
- Funcional e inmutable

---

## 🏗️ Arquitectura

### Arquitectura por Capas (Layered Architecture)

```
┌────────────────────────────────────────┐
│         Pages (Screens)                │  ← Páginas de rutas
├────────────────────────────────────────┤
│      Components (UI Components)        │  ← Componentes reutilizables
├────────────────────────────────────────┤
│         Hooks (Custom Hooks)           │  ← Lógica reutilizable
├────────────────────────────────────────┤
│       Services (API calls)             │  ← Comunicación con backend
├────────────────────────────────────────┤
│        Store (Global State)            │  ← Estado global (Zustand)
└────────────────────────────────────────┘
```

**Principios SOLID aplicados:**
- **Single Responsibility**: Cada componente hace una sola cosa
- **Open/Closed**: Componentes extensibles sin modificar
- **Dependency Inversion**: Componentes dependen de abstracciones (hooks)

---

## 📁 Estructura de Carpetas

```
frontend/
├── public/
│   └── davivienda.png          # Logo de la empresa
│
├── src/
│   ├── components/             # 🧩 Componentes reutilizables
│   │   ├── ui/                 # Componentes base (Button, Input, etc)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Alert.tsx
│   │   │
│   │   ├── layout/             # Componentes de layout
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   └── features/           # Componentes de funcionalidades
│   │       ├── TaskCard.tsx    # Card de tarea individual
│   │       ├── TaskForm.tsx    # Formulario crear/editar
│   │       ├── TaskFilters.tsx # Filtros de búsqueda
│   │       └── TaskList.tsx    # Lista de tareas
│   │
│   ├── pages/                  # 📄 Páginas (rutas)
│   │   ├── LoginPage.tsx       # /login
│   │   ├── RegisterPage.tsx    # /register
│   │   ├── TasksPage.tsx       # /tasks (dashboard)
│   │   └── NotFoundPage.tsx    # /404
│   │
│   ├── hooks/                  # 🪝 Custom Hooks
│   │   ├── useAuth.ts          # Hook de autenticación
│   │   ├── useTasks.ts         # Hook de tareas (React Query)
│   │   └── useFilters.ts       # Hook de filtros
│   │
│   ├── services/               # 🔌 API Services
│   │   ├── api.ts              # Cliente Axios configurado
│   │   ├── authService.ts      # Servicios de autenticación
│   │   └── taskService.ts      # Servicios de tareas
│   │
│   ├── store/                  # 🗄️ Estado Global (Zustand)
│   │   └── authStore.ts        # Store de autenticación
│   │
│   ├── types/                  # 📝 TypeScript Types
│   │   ├── auth.types.ts       # User, LoginCredentials, etc
│   │   ├── task.types.ts       # Task, TaskFilters, etc
│   │   └── api.types.ts        # Respuestas de API
│   │
│   ├── utils/                  # 🛠️ Utilidades
│   │   ├── formatDate.ts       # Formateo de fechas
│   │   ├── constants.ts        # Constantes globales
│   │   └── validators.ts       # Validaciones custom
│   │
│   ├── App.tsx                 # 🎯 Componente raíz
│   ├── main.tsx                # 🚀 Punto de entrada
│   └── index.css               # 🎨 Estilos globales (Tailwind)
│
├── .env                        # Variables de entorno
├── .env.example                # Ejemplo de .env
├── tailwind.config.js          # Configuración Tailwind
├── postcss.config.js           # Configuración PostCSS
├── tsconfig.json               # Configuración TypeScript
├── vite.config.ts              # Configuración Vite
├── package.json                # Dependencias y scripts
└── README.md                   # Este archivo
```

---

## 🎨 Patrones de Diseño

### 1. **Component Composition Pattern**

**¿Qué hace?**: Componer componentes complejos desde simples

**Implementación**:
```tsx
// Card base reutilizable
<Card>
  <Card.Header>
    <Card.Title>Título</Card.Title>
  </Card.Header>
  <Card.Content>
    Contenido
  </Card.Content>
</Card>

// TaskCard compone Card + lógica específica
<TaskCard task={task}>
  <TaskCard.Actions>
    <Button>Editar</Button>
  </TaskCard.Actions>
</TaskCard>
```

**Ventaja**: Componentes flexibles y reutilizables

### 2. **Custom Hooks Pattern**

**¿Qué hace?**: Encapsula lógica reutilizable

**Implementación**:
```tsx
// hooks/useTasks.ts
export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskService.getTasks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// En el componente
function TasksPage() {
  const { data: tasks, isLoading } = useTasks(filters);
  // Lógica de tareas abstraída
}
```

**Ventaja**: Lógica compartida entre componentes

### 3. **Container/Presentational Pattern**

**¿Qué hace?**: Separa lógica de presentación

**Implementación**:
```tsx
// TaskListContainer (lógica)
function TaskListContainer() {
  const { data, isLoading } = useTasks();
  const { mutate: deleteTask } = useDeleteTask();
  
  return (
    <TaskListPresentation 
      tasks={data} 
      isLoading={isLoading}
      onDelete={deleteTask}
    />
  );
}

// TaskListPresentation (solo UI)
function TaskListPresentation({ tasks, isLoading, onDelete }) {
  return (
    <div>
      {tasks.map(task => <TaskCard key={task.id} {...task} />)}
    </div>
  );
}
```

**Ventaja**: Componentes más testeables y reutilizables

### 4. **Protected Route Pattern**

**¿Qué hace?**: Protege rutas que requieren autenticación

**Implementación**:
```tsx
// ProtectedRoute.tsx
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// En App.tsx
<Route path="/tasks" element={
  <ProtectedRoute>
    <TasksPage />
  </ProtectedRoute>
} />
```

**Ventaja**: Seguridad en el cliente

### 5. **Optimistic Updates Pattern**

**¿Qué hace?**: Actualiza UI antes de confirmación del servidor

**Implementación**:
```tsx
const updateTaskMutation = useMutation({
  mutationFn: taskService.updateTask,
  onMutate: async (newTask) => {
    // Actualización optimista
    await queryClient.cancelQueries(['tasks']);
    const previous = queryClient.getQueryData(['tasks']);
    queryClient.setQueryData(['tasks'], (old) => 
      old.map(t => t.id === newTask.id ? newTask : t)
    );
    return { previous };
  },
  onError: (err, newTask, context) => {
    // Rollback si falla
    queryClient.setQueryData(['tasks'], context.previous);
  },
});
```

**Ventaja**: UI instantánea, mejor UX

---

## 📝 Convenciones de Código

### Nomenclatura

**PascalCase**: Componentes, Interfaces, Types
```tsx
interface TaskProps {}
type UserResponse = {}
function TaskCard() {}
```

**camelCase**: Variables, funciones, hooks
```tsx
const isLoading = true;
function handleSubmit() {}
const useTasks = () => {}
```

**UPPER_SNAKE_CASE**: Constantes
```tsx
const API_BASE_URL = 'http://localhost:8000';
const MAX_TASKS_PER_PAGE = 20;
```

### Estructura de Componentes

```tsx
// 1. Imports (agrupados)
import { useState, useEffect } from 'react';  // React
import { useQuery } from '@tanstack/react-query';  // Librerías
import { Button } from '@/components/ui';  // Componentes
import type { Task } from '@/types';  // Types

// 2. Types/Interfaces
interface TaskCardProps {
  task: Task;
  onDelete: (id: number) => void;
}

// 3. Componente
export function TaskCard({ task, onDelete }: TaskCardProps) {
  // 3.1. Hooks
  const [isEditing, setIsEditing] = useState(false);
  
  // 3.2. Handlers
  const handleEdit = () => setIsEditing(true);
  
  // 3.3. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 3.4. Render
  return (
    <div className="card">
      {/* JSX */}
    </div>
  );
}
```

### TypeScript Best Practices

```tsx
// ✅ Bueno: Tipos explícitos
interface User {
  id: number;
  email: string;
  name: string;
}

// ✅ Bueno: Props tipadas
type ButtonProps = {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
};

// ✅ Bueno: Return types en funciones
function getUser(id: number): Promise<User> {
  return api.get(`/users/${id}`);
}

// ❌ Malo: any
function processData(data: any) {}  // Evitar any

// ✅ Bueno: unknown o genéricos
function processData<T>(data: T): T {
  return data;
}
```

### Tailwind CSS Best Practices

```tsx
// ✅ Bueno: Clases ordenadas (responsive, states, utilities)
<button className="
  px-4 py-2 rounded-lg
  bg-red-600 hover:bg-red-700
  text-white font-semibold
  transition-colors
  disabled:opacity-50
">
  Click me
</button>

// ✅ Bueno: Condicionales con clsx/cn
import { cn } from '@/utils/cn';

<div className={cn(
  "base-class",
  isActive && "active-class",
  isPrimary ? "primary-class" : "secondary-class"
)} />

// ❌ Malo: Estilos inline mezclados con Tailwind
<div className="p-4" style={{ marginTop: '10px' }} />
```

---

## 🧩 Componentes

### Componentes Base (UI)

**Button.tsx**
```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}
```
- Variantes de colores
- Loading state con spinner
- Disabled state
- Full responsive

**Input.tsx**
```tsx
interface InputProps {
  type: 'text' | 'email' | 'password';
  label: string;
  error?: string;
  icon?: ReactNode;
}
```
- Validación visual
- Mensaje de error
- Iconos opcionales
- Password toggle

**Card.tsx**
- Container reutilizable
- Shadow y border radius
- Padding consistente

**Alert.tsx**
- Success, Error, Warning, Info
- Auto-dismiss opcional
- Iconos por tipo

### Componentes de Funcionalidades

**TaskCard.tsx**
- Muestra información de tarea
- Badges para estado y prioridad
- Acciones: Editar, Eliminar, Cambiar estado
- Animaciones de hover

**TaskForm.tsx**
- Formulario crear/editar
- Validación con React Hook Form
- Date picker para fecha límite
- Select para prioridad

**TaskFilters.tsx**
- Filtros de estado, prioridad, categoría
- Búsqueda por texto
- Ordenamiento
- Clear filters button

**TaskList.tsx**
- Grid responsive de TaskCards
- Empty state
- Loading skeleton
- Infinite scroll (opcional)

---

## 🗄️ State Management

### Zustand (Estado Global)

**authStore.ts**
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  login: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
```

**Cuándo usar Zustand:**
- Autenticación (token, user)
- Preferencias de usuario
- Theme (dark/light mode)
- Estado que persiste entre rutas

### React Query (Estado del Servidor)

```typescript
// hooks/useTasks.ts
export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskService.getTasks(filters),
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 10 * 60 * 1000, // 10 min
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarea creada');
    },
  });
}
```

**Ventajas de React Query:**
- ✅ Cache automático
- ✅ Revalidación en background
- ✅ Deduplicación de requests
- ✅ Retry automático
- ✅ Loading/error states

---

## 🔄 Flujo de Funcionamiento

### Flujo Completo: Crear Tarea

```
1. Usuario llena formulario
   ↓ TaskForm component

2. Submit form
   ↓ handleSubmit() con React Hook Form
   ↓ Validación client-side

3. Llamada a mutation
   ↓ useCreateTask() hook
   ↓ taskService.createTask(data)

4. Axios request
   ↓ POST /api/tasks
   ↓ Headers: Authorization Bearer token
   ↓ Body: task data

5. Interceptor agrega token
   ↓ api.interceptors.request

6. Backend procesa
   ↓ FastAPI valida y crea
   ↓ Retorna 201 + task creada

7. Response handling
   ↓ onSuccess callback
   ↓ queryClient.invalidateQueries(['tasks'])
   ↓ Toast success message

8. UI se actualiza
   ↓ React Query refetch automático
   ↓ TaskList se re-renderiza
   ↓ Nueva tarea aparece
```

### Ejemplo Real: Login

```tsx
// 1. LoginPage.tsx
function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Guardar token y user en store
      login(data.access_token, data.user);
      // Navegar a dashboard
      navigate('/tasks');
    },
  });
  
  const handleSubmit = (values) => {
    loginMutation.mutate(values);
  };
  
  return <LoginForm onSubmit={handleSubmit} />;
}

// 2. authService.ts
export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

// 3. api.ts (Axios instance)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor agrega token a todas las requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 4. authStore.ts (Zustand)
login: (token, user) => {
  localStorage.setItem('token', token);
  set({ token, user, isAuthenticated: true });
}
```

---

## 🚦 Instalación

### Requisitos Previos

- Node.js 18+ 
- npm o yarn o pnpm

### Setup

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend

# 4. Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
http://localhost:3000
```

### Variables de Entorno (.env)

```env
VITE_API_URL=http://localhost:8000
```

### 🚀 Despliegue

### Docker

El proyecto incluye configuración para desplegar con Docker y Nginx.

1. Construir la imagen:
```bash
docker build -t davivienda-frontend .
```

2. Ejecutar el contenedor:
```bash
docker run -p 3000:80 davivienda-frontend
```

3. La aplicación estará disponible en `http://localhost:3000`

### Desarrollo Local

```bash
npm install
npm run dev
```

## 🧪 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia dev server con HMR

# Build
npm run build        # Build para producción
npm run preview      # Preview del build

# Linting y formato
npm run lint         # ESLint
npm run format       # Prettier

# Testing
npm run test         # Ejecutar tests
npm run test:ui      # UI de tests
npm run coverage     # Test coverage
```

---

## 🧪 Testing

### Testing con Vitest

```bash
# Ejecutar tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Ejemplo de Test

```tsx
// TaskCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    status: 'pending',
    priority: 2,
  };
  
  it('renders task title', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
  
  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(<TaskCard task={mockTask} onDelete={onDelete} />);
    
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
```

---

## 🎨 Diseño y UX

### Paleta de Colores (Davivienda)

```css
/* Primary (Rojo Davivienda) */
--color-primary: #ED1C24;

/* Grays */
--color-gray-50: #F9FAFB;
--color-gray-900: #111827;

/* Status */
--color-success: #10B981;
--color-warning: #F59E0B;
--color-error: #EF4444;
```

### Responsive Design

```tsx
// Mobile first approach
<div className="
  px-4        // Mobile
  md:px-8     // Tablet
  lg:px-16    // Desktop
">
```

**Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 📊 Fortalezas de la Plataforma

✅ **Performance**: Vite + React 18 + lazy loading
✅ **Type Safety**: TypeScript en todo el proyecto
✅ **Developer Experience**: HMR instantáneo, autocompletado
✅ **User Experience**: Loading states, optimistic updates, toasts
✅ **Responsive**: Mobile-first design
✅ **Maintainable**: Componentes reutilizables, clean code
✅ **Scalable**: Arquitectura modular, fácil de extender
✅ **Modern**: Últimas versiones de todas las librerías

---

## 📚 Documentación Adicional

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://docs.pmnd.rs/zustand)

---


