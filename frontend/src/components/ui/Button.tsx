/**
 * Componente Button reutilizable.
 * 
 * Variantes:
 * - primary: Rojo Davivienda
 * - secondary: Gris
 * - danger: Rojo oscuro
 * - ghost: Transparente
 */

import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  readonly isLoading?: boolean;
  readonly fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-davivienda-red text-white hover:bg-red-700 focus:ring-davivienda-red',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {' '}
          Cargando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
