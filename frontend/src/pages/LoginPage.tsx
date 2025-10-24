/**
 * Página de Login con componentes reutilizables.
 * 
 * Características:
 * - Validación de formularios
 * - Mensajes de error claros
 * - Toggle de contraseña
 * - Manejo de estados HTTP
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { handleApiError } from '../utils/errorHandler';
import { useAlert } from '../hooks/useAlert';

// Componentes
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const { alert, showAlert, hideAlert } = useAlert();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (tokens) => {
      try {
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        
        // Obtener datos del usuario
        const user = await authApi.me();
        setUser(user);
        
        showAlert('success', 'Sesión iniciada correctamente');
        
        setTimeout(() => {
          navigate('/');
        }, 500);
      } catch (error) {
        const apiError = handleApiError(error);
        showAlert('error', apiError.message);
      }
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      showAlert('error', apiError.message);
      
      // Validación específica para campos
      if (apiError.status === 401) {
        setErrors({
          username: 'Credenciales incorrectas',
          password: 'Credenciales incorrectas',
        });
      }
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = 'El usuario es requerido';
    } else if (username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showAlert('warning', 'Por favor corrige los errores en el formulario');
      return;
    }

    setErrors({});
    loginMutation.mutate({ username, password });
  };

  return (
    <AuthLayout
      title="Iniciar Sesión"
      subtitle="Accede a tu gestor de tareas"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {alert.visible && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={hideAlert}
          />
        )}

        <Input
          label="Usuario o Email"
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (errors.username) setErrors({ ...errors, username: '' });
          }}
          error={errors.username}
          placeholder="Tu usuario o email"
          autoComplete="username"
          disabled={loginMutation.isPending}
        />

        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors({ ...errors, password: '' });
          }}
          error={errors.password}
          placeholder="Tu contraseña"
          autoComplete="current-password"
          disabled={loginMutation.isPending}
        />

        <Button
          type="submit"
          variant="primary"
          isLoading={loginMutation.isPending}
          fullWidth
        >
          Iniciar Sesión
        </Button>

        <p className="text-center text-sm text-gray-600">
          ¿No tienes cuenta?
          {' '}
          <Link
            to="/register"
            className="font-medium text-davivienda-red hover:text-red-700 transition-colors"
          >
            Regístrate aquí
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
