/**
 * Componente Input reutilizable.
 * 
 * Características:
 * - Labels accesibles
 * - Estados de error
 * - Toggle para contraseña (ojo)
 * - Validación visual
 */

import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly error?: string;
  readonly helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  type = 'text',
  id,
  className = '',
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || label.toLowerCase().replaceAll(/\s+/g, '-');
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      <div className="relative">
        <input
          id={inputId}
          type={inputType}
          className={`
            w-full px-3 py-2 border rounded-md
            focus:outline-none focus:ring-2 focus:ring-davivienda-red focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${isPassword ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
