/**
 * Componente AuthLayout.
 * 
 * Layout para páginas de autenticación:
 * - Login
 * - Register
 * - Forgot Password
 */

import type { ReactNode } from 'react';

interface AuthLayoutProps {
  readonly children: ReactNode;
  readonly title: string;
  readonly subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo y título */}
        <div className="text-center">
          <img
            src="/davivienda.png"
            alt="Davivienda"
            className="mx-auto h-20 w-auto mb-6"
            onError={(e) => {
              // Fallback si no existe el logo
              e.currentTarget.style.display = 'none';
            }}
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
        </div>

        {/* Contenido */}
        <div className="bg-white py-8 px-4 shadow-md rounded-lg sm:px-10">{children}</div>
      </div>
    </div>
  );
}
