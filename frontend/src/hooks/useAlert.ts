/**
 * Hook personalizado para manejo de alertas/toasts.
 * 
 * Uso:
 * const { showAlert, alert, hideAlert } = useAlert();
 * showAlert('error', 'Mensaje de error');
 */

import { useState, useCallback } from 'react';

interface AlertState {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  visible: boolean;
}

export const useAlert = () => {
  const [alert, setAlert] = useState<AlertState>({
    type: 'info',
    message: '',
    visible: false,
  });

  const showAlert = useCallback((type: AlertState['type'], message: string) => {
    setAlert({ type, message, visible: true });
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      hideAlert();
    }, 5000);
  }, []);

  const hideAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, visible: false }));
  }, []);

  return { alert, showAlert, hideAlert };
};
