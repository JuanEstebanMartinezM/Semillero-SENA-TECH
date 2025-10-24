/**
 * Componente de Alerta reutilizable.
 * 
 * Muestra mensajes de:
 * - Error (rojo)
 * - Success (verde)
 * - Warning (amarillo)
 * - Info (azul)
 */

import { FiAlertCircle, FiCheckCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

interface AlertProps {
  readonly type: 'error' | 'success' | 'warning' | 'info';
  readonly message: string;
  readonly onClose?: () => void;
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    error: 'bg-red-50 border-red-500 text-red-800',
    success: 'bg-green-50 border-green-500 text-green-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
  };

  const icons = {
    error: <FiAlertCircle className="w-5 h-5" />,
    success: <FiCheckCircle className="w-5 h-5" />,
    warning: <FiAlertTriangle className="w-5 h-5" />,
    info: <FiInfo className="w-5 h-5" />,
  };

  return (
    <div className={`border-l-4 p-4 rounded-md ${styles[type]} flex items-start justify-between`}>
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0">{icons[type]}</span>
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          aria-label="Cerrar alerta"
        >
          <FiX className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
