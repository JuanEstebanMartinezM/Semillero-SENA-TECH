/**
 * Página de Registro con componentes reutilizables.
 * 
 * Características:
 * - Validación completa de formularios
 * - Mensajes de error específicos
 * - Toggle de contraseña
 * - Confirmación de contraseña
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { handleApiError } from '../utils/errorHandler';
import { useAlert } from '../hooks/useAlert';

// Componentes
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const { alert, showAlert, hideAlert } = useAlert();

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      showAlert('success', 'Registro completado correctamente');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      showAlert('error', apiError.message);
      
      // Validación específica del backend
      if (apiError.status === 400 && apiError.details) {
        try {
          const details = JSON.parse(apiError.details);
          const newErrors: Record<string, string> = {};
          
          if (details.email) newErrors.email = details.email[0];
          if (details.username) newErrors.username = details.username[0];
          
          setErrors(newErrors);
        } catch {
          // Si no se puede parsear, mostrar error genérico
        }
      }
    },
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Username
    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    } else if (!/^\w+$/.test(formData.username)) {
      newErrors.username = 'El usuario solo puede contener letras, números y guión bajo';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener mayúsculas, minúsculas, números y un carácter especial';
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Full Name (opcional pero con validación si se proporciona)
    if (formData.full_name && formData.full_name.length < 2) {
      newErrors.full_name = 'El nombre debe tener al menos 2 caracteres';
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
    
    // Enviar solo los campos requeridos
    const { confirmPassword, ...registerData } = formData;
    registerMutation.mutate(registerData);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <AuthLayout
      title="Crear Cuenta"
      subtitle="Regístrate para comenzar a gestionar tus tareas"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {alert.visible && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={hideAlert}
          />
        )}

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          error={errors.email}
          placeholder="correo@ejemplo.com"
          autoComplete="email"
          disabled={registerMutation.isPending}
        />

        <Input
          label="Usuario"
          type="text"
          value={formData.username}
          onChange={(e) => handleFieldChange('username', e.target.value)}
          error={errors.username}
          placeholder="usuario123"
          helperText="Solo letras, números y guión bajo"
          autoComplete="username"
          disabled={registerMutation.isPending}
        />

        <Input
          label="Nombre Completo (opcional)"
          type="text"
          value={formData.full_name}
          onChange={(e) => handleFieldChange('full_name', e.target.value)}
          error={errors.full_name}
          placeholder="Juan Pérez"
          autoComplete="name"
          disabled={registerMutation.isPending}
        />

        <Input
          label="Contraseña"
          type="password"
          value={formData.password}
          onChange={(e) => handleFieldChange('password', e.target.value)}
          error={errors.password}
          placeholder="********"
          helperText="Mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos (!@#$%^&*)"
          autoComplete="new-password"
          disabled={registerMutation.isPending}
        />

        <Input
          label="Confirmar Contraseña"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          placeholder="********"
          autoComplete="new-password"
          disabled={registerMutation.isPending}
        />

        <Button
          type="submit"
          variant="primary"
          isLoading={registerMutation.isPending}
          fullWidth
        >
          Crear Cuenta
        </Button>

        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?
          {' '}
          <Link
            to="/login"
            className="font-medium text-davivienda-red hover:text-red-700 transition-colors"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
