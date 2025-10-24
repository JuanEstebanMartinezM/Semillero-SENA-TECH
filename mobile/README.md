# 📱 Davivienda Task Manager - Mobile App

Aplicación móvil nativa (iOS/Android) de gestión de tareas construida con **React Native**, **Expo** y **TypeScript**, ofreciendo una experiencia móvil fluida y nativa.

---

## 📋 Tabla de Contenidos

- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Estructura de Carpetas](#-estructura-de-carpetas)
- [Patrones de Diseño](#-patrones-de-diseño)
- [Convenciones de Código](#-convenciones-de-código)
- [Componentes](#-componentes)
- [Navegación](#-navegación)
- [State Management](#-state-management)
- [Flujo de Funcionamiento](#-flujo-de-funcionamiento)
- [Instalación](#-instalación)

---

## 🚀 Tecnologías

### Framework Principal

**React Native (vía Expo SDK 54)**
- **¿Por qué?**: Framework para crear apps móviles nativas con React
- **Ventajas**:
  - Código compartido iOS/Android (95%+)
  - Componentes nativos (no webview)
  - Hot reload para desarrollo rápido
  - Acceso a APIs nativas
  - Performance cercana a nativo

**Expo 54.0.0**
- **¿Por qué?**: Plataforma y conjunto de herramientas para React Native
- **Ventajas**:
  - Configuración zero - no need para Xcode/Android Studio
  - Expo Go para testing en dispositivos reales
  - OTA (Over-The-Air) updates
  - SDK con módulos pre-configurados
  - Build service en la nube (EAS)

**TypeScript 5.6.3**
- **¿Por qué?**: Type safety en JavaScript
- **Ventajas**:
  - Detección de errores en desarrollo
  - Autocompletado inteligente
  - Refactoring seguro
  - Mejor documentación del código

### Navegación

**React Navigation 7.0.13**
- **¿Por qué?**: Solución de routing más popular para React Native
- **Ventajas**:
  - Stack, Tab, Drawer navigators
  - Deep linking support
  - Gestión del back button (Android)
  - Animaciones de transición fluidas
  - TypeScript support completo

**@react-navigation/native-stack**
- Stack navigator nativo (mejor performance)
- Usa APIs nativas de navegación

### Estado y Data Fetching

**TanStack Query 5.90.5** (React Query)
- **¿Por qué?**: Gestión de estado del servidor
- **Ventajas**:
  - Cache automático de peticiones
  - Revalidación en background
  - Optimistic updates
  - Retry logic automático
  - Offline support

**Zustand 5.0.8**
- **¿Por qué?**: State management minimalista
- **Ventajas**:
  - API simple e intuitiva
  - Menos boilerplate que Redux
  - Perfecto para React Native
  - TypeScript first-class

### HTTP Client

**Axios 1.12.2**
- **¿Por qué?**: Cliente HTTP robusto
- **Ventajas**:
  - Interceptors para tokens
  - Transformación de respuestas
  - Timeout management
  - Error handling consistente

### Storage

**@react-native-async-storage/async-storage 2.1.0**
- **¿Por qué?**: Persistencia de datos local
- **Ventajas**:
  - API simple key-value
  - Async/await
  - Almacena tokens, configuración, cache
  - Cross-platform (iOS/Android)

### UI Components

**@expo/vector-icons 14.0.4**
- **¿Por qué?**: Librería de iconos integrada con Expo
- **Ventajas**:
  - 10,000+ iconos (Ionicons, MaterialIcons, FontAwesome, etc.)
  - Tree-shaking
  - Customizables con props
  - Uso optimizado en Expo

**@react-native-community/datetimepicker 8.2.0**
- Selector de fecha/hora nativo
- UI nativa de iOS y Android
- Mejor UX que webviews

**react-native-safe-area-context 5.0.0**
- Manejo de safe areas (notch, status bar)
- Componente SafeAreaView
- Essential para iPhone X+

### Utilidades

**expo-constants 17.0.3**
- Acceso a configuración de la app
- Variables de entorno
- Información del dispositivo

**date-fns 4.1.0**
- Manipulación de fechas
- Ligera y modular
- Funcional e inmutable

---

## 🏗️ Arquitectura

### Arquitectura por Capas (Mobile-First)

```
┌────────────────────────────────────────┐
│         Screens (Views)                │  ← Pantallas de navegación
├────────────────────────────────────────┤
│      Components (UI Components)        │  ← Componentes reutilizables
├────────────────────────────────────────┤
│         Hooks (Custom Hooks)           │  ← Lógica reutilizable
├────────────────────────────────────────┤
│        API (Services)                  │  ← Comunicación con backend
├────────────────────────────────────────┤
│        Store (Global State)            │  ← Estado global (Zustand)
├────────────────────────────────────────┤
│      Navigation (Routing)              │  ← React Navigation
└────────────────────────────────────────┘
```

**Diferencias con Web:**
- StyleSheet API en lugar de CSS/Tailwind
- Componentes nativos (View, Text, TouchableOpacity)
- Navegación con stack en lugar de rutas URL
- Gestos y animaciones nativas
- Safe areas y platform-specific code

---

## 📁 Estructura de Carpetas

```
mobile/
├── assets/
│   └── images/
│       └── davivienda.png      # Logo de la empresa
│
├── src/
│   ├── components/             # 🧩 Componentes reutilizables
│   │   ├── Button.tsx          # Botón con variantes (primary, secondary)
│   │   ├── Input.tsx           # Input con validación y password toggle
│   │   ├── Card.tsx            # Container con shadow
│   │   ├── Alert.tsx           # Alertas (success, error, warning, info)
│   │   └── TaskFormModal.tsx   # Modal de crear/editar tarea
│   │
│   ├── screens/                # 📱 Pantallas (navegación)
│   │   ├── LoginScreen.tsx     # Pantalla de login
│   │   ├── RegisterScreen.tsx  # Pantalla de registro
│   │   └── TasksScreen.tsx     # Dashboard de tareas
│   │
│   ├── navigation/             # 🧭 Navegación
│   │   └── index.tsx           # Stack Navigator, protected routes
│   │
│   ├── hooks/                  # 🪝 Custom Hooks
│   │   └── useAlert.ts         # Hook para mostrar alertas
│   │
│   ├── api/                    # 🔌 API Services
│   │   ├── client.ts           # Axios instance configurada
│   │   ├── auth.ts             # Servicios de autenticación
│   │   └── tasks.ts            # Servicios de tareas
│   │
│   ├── store/                  # 🗄️ Estado Global (Zustand)
│   │   └── authStore.ts        # Store de autenticación
│   │
│   ├── types/                  # 📝 TypeScript Types
│   │   └── index.ts            # User, Task, TaskFilters, etc.
│   │
│   ├── utils/                  # 🛠️ Utilidades
│   │   └── errorHandler.ts     # Manejo de errores de API
│   │
│   └── App.tsx                 # 🎯 Componente raíz
│
├── app.config.js               # Configuración Expo
├── babel.config.js             # Configuración Babel
├── tsconfig.json               # Configuración TypeScript
├── package.json                # Dependencias y scripts
└── README.md                   # Este archivo
```

---

## 🎨 Patrones de Diseño

### 1. **StyleSheet Pattern** (React Native)

**¿Qué hace?**: Estilos optimizados con StyleSheet API

**Implementación**:
```tsx
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ED1C24',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

// Uso
<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>Click</Text>
</TouchableOpacity>
```

**Ventajas:**
- Optimización automática de React Native
- Validación de estilos
- Autocompletado en IDE

### 2. **Platform-Specific Code**

**¿Qué hace?**: Código diferente para iOS y Android

**Implementación**:
```tsx
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```

**Ventaja**: UX nativa para cada plataforma

### 3. **Custom Hooks for Logic**

**¿Qué hace?**: Encapsula lógica de componentes

**Implementación**:
```tsx
// hooks/useAlert.ts
export function useAlert() {
  const [alert, setAlert] = useState({
    visible: false,
    type: 'info',
    message: '',
  });
  
  const showAlert = (type, message) => {
    setAlert({ visible: true, type, message });
  };
  
  const hideAlert = () => {
    setAlert(prev => ({ ...prev, visible: false }));
  };
  
  return { alert, showAlert, hideAlert };
}
```

**Ventaja**: Lógica reutilizable entre pantallas

### 4. **Modal Pattern**

**¿Qué hace?**: Ventanas modales para formularios

**Implementación**:
```tsx
<Modal
  visible={visible}
  animationType="slide"
  transparent={true}
  onRequestClose={onClose}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      {/* Contenido del modal */}
    </View>
  </View>
</Modal>
```

**Ventaja**: UX móvil estándar

### 5. **Protected Navigation Pattern**

**¿Qué hace?**: Protege pantallas que requieren auth

**Implementación**:
```tsx
export default function Navigation() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Tasks" component={TasksScreen} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**Ventaja**: Seguridad en navegación

---

## 📝 Convenciones de Código

### Nomenclatura

**PascalCase**: Componentes, Screens, Types
```tsx
function LoginScreen() {}
interface TaskProps {}
type UserResponse = {}
```

**camelCase**: Variables, funciones, hooks
```tsx
const isLoading = true;
function handleSubmit() {}
const useAuth = () => {}
```

**UPPER_SNAKE_CASE**: Constantes
```tsx
const API_BASE_URL = 'http://192.168.1.4:8000';
const TASK_PRIORITY_HIGH = 3;
```

### Estructura de Componentes

```tsx
// 1. Imports
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 2. Types
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onPress: () => void;
  children: React.ReactNode;
}

// 3. Componente
export default function Button({ variant, onPress, children }: ButtonProps) {
  // Lógica
  return (
    <TouchableOpacity 
      style={[styles.button, styles[variant]]}
      onPress={onPress}
    >
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
}

// 4. Estilos
const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#ED1C24',
  },
  secondary: {
    backgroundColor: '#E5E7EB',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### TypeScript Best Practices

```tsx
// ✅ Bueno: Tipos explícitos
interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
}

// ✅ Bueno: Enums para constantes
export const TaskStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed"
} as const;

// ✅ Bueno: React Native component props
interface ScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Tasks'>;
  route: RouteProp<RootStackParamList, 'Tasks'>;
}
```

### StyleSheet Best Practices

```tsx
// ✅ Bueno: StyleSheet.create para optimización
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});

// ✅ Bueno: Arrays para estilos condicionales
<View style={[
  styles.card,
  isActive && styles.cardActive,
  { marginTop: spacing }
]} />

// ✅ Bueno: Platform-specific
const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});

// ❌ Malo: Estilos inline repetitivos
<View style={{ paddingHorizontal: 16, paddingVertical: 20 }} />
```

---

## 🧩 Componentes

### Componentes Base

**Button.tsx**
```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}
```
- Variantes de colores (Davivienda red primary)
- Loading state con ActivityIndicator
- Disabled state con opacity
- Full width option

**Input.tsx**
```tsx
interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
}
```
- Label con validación visual
- Error message debajo
- Password toggle con ícono
- Multiline support

**Card.tsx**
- Container con shadow nativo
- Border radius consistente
- Padding interno
- Background blanco

**Alert.tsx**
- Tipos: success, error, warning, info
- Iconos por tipo (Ionicons)
- Dismissible con botón X
- Animación de entrada

**TaskFormModal.tsx**
- Modal full-featured
- Campos: title, description, category, priority, due_date
- Date picker nativo
- Validación de campos requeridos
- Modos: create / edit

### Pantallas (Screens)

**LoginScreen.tsx**
- Logo de Davivienda
- Form: username, password
- Validación client-side
- Loading state
- Navegación a Register
- SafeAreaView para notch

**RegisterScreen.tsx**
- Form: email, username, full_name, password, confirmPassword
- Validación compleja (email regex, password strength)
- Success message
- Auto-navegación a Login

**TasksScreen.tsx**
- Header con título y logout
- Filtros expandibles (search, status, priority)
- Lista de tareas con FlatList
- Pull-to-refresh
- FAB (Floating Action Button) para crear
- Task card con acciones (edit, delete, change status)
- Empty state con ícono
- Loading skeleton

---

## 🧭 Navegación

### Stack Navigator

```tsx
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Tasks: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
```

### Uso en Componentes

```tsx
// Tipo de navegación
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

// En el componente
const navigation = useNavigation<LoginScreenNavigationProp>();

// Navegar
navigation.navigate('Tasks');

// Go back
navigation.goBack();
```

---

## 🗄️ State Management

### Zustand (Estado Global)

**authStore.ts**
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, tokens: Tokens) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (user, tokens) => {
    await AsyncStorage.setItem('access_token', tokens.access_token);
    await AsyncStorage.setItem('refresh_token', tokens.refresh_token);
    set({ user, isAuthenticated: true });
  },
  
  logout: async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    set({ user: null, isAuthenticated: false });
  },
  
  checkAuth: async () => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      // Validar token y obtener user
      const user = await authApi.me();
      set({ user, isAuthenticated: true });
    }
  },
}));
```

### React Query (Servidor)

```typescript
// En TasksScreen.tsx
const { data, isLoading, refetch } = useQuery({
  queryKey: ['tasks', filters],
  queryFn: () => tasksApi.getTasks(filters),
});

const deleteMutation = useMutation({
  mutationFn: tasksApi.deleteTask,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    showAlert('success', 'Tarea eliminada');
  },
});
```

---

## 🔄 Flujo de Funcionamiento

### Flujo Completo: Crear Tarea desde Móvil

```
1. Usuario toca FAB (+)
   ↓ TasksScreen state: setIsModalVisible(true)

2. Modal se abre
   ↓ TaskFormModal slides up animado
   ↓ Formulario con campos vacíos

3. Usuario llena form
   ↓ title: "Llamar cliente"
   ↓ priority: Alta (3)
   ↓ due_date: Selecciona del calendario nativo

4. Usuario toca "Crear"
   ↓ handleSubmit()
   ↓ Validación: title no vacío ✅

5. Llamada a mutation
   ↓ createMutation.mutate(formData)
   ↓ tasksApi.createTask(data)

6. Axios request
   ↓ POST http://192.168.1.4:8000/api/tasks
   ↓ Header: Authorization Bearer <token>
   ↓ Body: { title, priority, due_date }

7. Interceptor agrega token
   ↓ api.interceptors.request
   ↓ Token desde AsyncStorage

8. Backend procesa
   ↓ FastAPI valida y crea
   ↓ 201 Created + task data

9. Response handling
   ↓ onSuccess callback
   ↓ queryClient.invalidateQueries(['tasks'])
   ↓ Modal cierra
   ↓ Alert success

10. UI actualiza
    ↓ React Query refetch
    ↓ FlatList re-renderiza
    ↓ Nueva tarea aparece en lista
```

### Diferencias con Web

| Aspecto | Web | Mobile |
|---------|-----|--------|
| **Estilos** | CSS/Tailwind | StyleSheet API |
| **Componentes** | `<div>`, `<button>` | `<View>`, `<TouchableOpacity>` |
| **Navegación** | URL routes | Stack Navigator |
| **Storage** | localStorage | AsyncStorage |
| **Gestos** | onClick | onPress, Gesture Recognizers |
| **Scroll** | CSS overflow | ScrollView, FlatList |
| **Input** | `<input>` | `<TextInput>` |
| **Modales** | HTML modal | React Native Modal |

---

## 🚦 Instalación

### Requisitos Previos

- Node.js 18+
- Expo CLI
- Expo Go app en tu teléfono (iOS/Android)

### Setup

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd mobile

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Editar app.config.js con tu IP local

# 4. Iniciar Expo
npx expo start

# 5. Escanear QR code con Expo Go
# iOS: Camera app
# Android: Expo Go app
```

### Configuración de API

**app.config.js**
```javascript
module.exports = {
  expo: {
    extra: {
      // Cambiar por tu IP local
      apiUrl: "http://192.168.1.4:8000"
    }
  }
};
```

**Obtener tu IP local:**
```bash
# Linux/Mac
hostname -I | awk '{print $1}'

# Windows
ipconfig
# Buscar "IPv4 Address"
```

### Scripts Disponibles

```bash
# Desarrollo
npx expo start              # Inicia dev server
npx expo start --clear      # Limpia cache
npx expo start --tunnel     # Usa tunnel (no requiere misma red)

# Build
eas build -p android        # Build APK (requiere EAS)
eas build -p ios            # Build IPA (requiere EAS)

# Testing
npm run test                # Ejecutar tests
npm run lint                # ESLint
```

---

## 📱 Testing en Dispositivo

### Con Expo Go (Desarrollo)

1. Instalar Expo Go desde:
   - iOS: App Store
   - Android: Google Play

2. Asegurar que PC y móvil estén en la misma red WiFi

3. Escanear QR code:
   - iOS: App de Cámara
   - Android: Expo Go app

4. App se carga en tu dispositivo

### Build Standalone

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar proyecto
eas build:configure

# Build Android APK
eas build -p android --profile preview

# Build iOS (requiere Apple Developer account)
eas build -p ios --profile preview
```

---

## 🔒 Seguridad

### Tokens en AsyncStorage

```typescript
// Guardar tokens
await AsyncStorage.setItem('access_token', token);

// Recuperar tokens
const token = await AsyncStorage.getItem('access_token');

// Eliminar tokens (logout)
await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
```

### Interceptor de Axios

```typescript
// client.ts
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh token automático
api.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Intentar refresh
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (refreshToken) {
        const newToken = await refreshAccessToken(refreshToken);
        // Reintentar request original
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 📊 Fortalezas de la Plataforma

✅ **Performance Nativa**: React Native + componentes nativos
✅ **Cross-Platform**: Un código para iOS y Android (95%+)
✅ **Type Safety**: TypeScript completo
✅ **Developer Experience**: Expo + HMR instantáneo
✅ **User Experience**: Gestos nativos, animaciones fluidas
✅ **Offline Support**: AsyncStorage + React Query cache
✅ **Maintainable**: Componentes reutilizables, clean code
✅ **Scalable**: Arquitectura modular

---

## 🔍 Debugging

### React Native Debugger

```bash
# Instalar
brew install --cask react-native-debugger

# En Expo Dev Menu
# Shake device → Debug Remote JS
```

### Console Logs

```tsx
// Ver en terminal de Expo
console.log('🔍 Debug:', variable);
console.error('❌ Error:', error);
console.warn('⚠️ Warning:', warning);
```

### Expo Dev Menu

- **iOS**: Shake device o Cmd+D (simulator)
- **Android**: Shake device o Cmd+M (emulator)

Opciones:
- Reload
- Debug Remote JS
- Toggle Performance Monitor
- Toggle Element Inspector

---

## 📚 Recursos

- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [TanStack Query](https://tanstack.com/query/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🚀 Next Steps

- [ ] Agregar push notifications con Expo Notifications
- [ ] Implementar biometric auth (FaceID/TouchID)
- [ ] Agregar modo offline completo
- [ ] Implementar deep linking
- [ ] Agregar analytics (Expo Analytics)
- [ ] Optimizar imágenes con expo-image
- [ ] Agregar splash screen personalizado

---

**Desarrollado con ❤️ usando React Native + Expo + TypeScript**
