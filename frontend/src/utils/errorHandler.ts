/**
 * Manejador centralizado de errores HTTP.
 * 
 * Códigos de estado HTTP:
 * - 200: OK
 * - 301: Moved Permanently
 * - 302: Found (redirect temporal)
 * - 400: Bad Request
 * - 401: Unauthorized
 * - 403: Forbidden
 * - 404: Not Found
 * - 500: Internal Server Error
 * - 502: Bad Gateway
 * - 503: Service Unavailable
 */

import type { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status: number;
  details?: string;
}

/**
 * Extrae y formatea mensajes de error de respuestas de la API.
 */
export const handleApiError = (error: unknown): ApiError => {
  // Error de Axios
  if (isAxiosError(error)) {
    const status = error.response?.status || 0;
    const data = error.response?.data as Record<string, unknown> | undefined;

    // Intentar extraer mensaje del backend
    const backendMessage = (data?.detail || data?.message || data?.error) as string | undefined;

    switch (status) {
      case 400:
        return {
          message: backendMessage || 'Datos inválidos. Por favor verifica la información.',
          status,
          details: typeof data === 'object' ? JSON.stringify(data) : undefined,
        };

      case 401:
        return {
          message: backendMessage || 'Credenciales inválidas. Por favor verifica tu usuario y contraseña.',
          status,
        };

      case 403:
        return {
          message: 'No tienes permisos para realizar esta acción.',
          status,
        };

      case 404:
        return {
          message: 'El recurso solicitado no existe.',
          status,
        };

      case 500:
        return {
          message: 'Error interno del servidor. Por favor intenta más tarde.',
          status,
        };

      case 502:
        return {
          message: 'El servidor no está disponible. Por favor intenta más tarde.',
          status,
        };

      case 503:
        return {
          message: 'Servicio temporalmente no disponible. Por favor intenta más tarde.',
          status,
        };

      default:
        return {
          message: backendMessage || 'Error de conexión. Por favor verifica tu conexión a internet.',
          status,
        };
    }
  }

  // Error genérico
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 0,
    };
  }

  return {
    message: 'Ocurrió un error inesperado.',
    status: 0,
  };
};

/**
 * Type guard para AxiosError.
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/**
 * Obtiene un mensaje amigable basado en el código de estado.
 */
export const getStatusMessage = (status: number): string => {
  const messages: Record<number, string> = {
    200: 'Operación exitosa',
    201: 'Recurso creado exitosamente',
    204: 'Operación completada',
    301: 'Recurso movido permanentemente',
    302: 'Recurso redirigido',
    400: 'Solicitud inválida',
    401: 'No autorizado',
    403: 'Acceso denegado',
    404: 'No encontrado',
    500: 'Error del servidor',
    502: 'Puerta de enlace incorrecta',
    503: 'Servicio no disponible',
  };

  return messages[status] || `Error ${status}`;
};
