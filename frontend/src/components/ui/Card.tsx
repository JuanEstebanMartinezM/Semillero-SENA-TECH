/**
 * Componente Card reutilizable.
 * 
 * Contenedor con:
 * - Sombra
 * - Padding
 * - Border radius
 * - Background blanco
 */

import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly noPadding?: boolean;
}

export default function Card({ noPadding = false, children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${noPadding ? '' : 'p-6'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
