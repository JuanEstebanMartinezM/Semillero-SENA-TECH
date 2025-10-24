"""
Middleware de rate limiting para prevenir abuso de API.

Implementa limitación de requests por IP y por usuario:
- Protege contra brute force
- Previene ataques DoS
- Limita uso de recursos
"""

from typing import Dict, Tuple
from datetime import datetime, timedelta
import time

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware que limita el número de requests por tiempo.
    
    Usa algoritmo de sliding window para rate limiting.
    Almacena contadores en memoria (para producción usar Redis).
    """
    
    def __init__(self, app, requests_per_minute: int = 60):
        """
        Inicializa el middleware de rate limiting.
        
        Args:
            app: Aplicación FastAPI
            requests_per_minute: Límite de requests por minuto
        """
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.request_counts: Dict[str, list] = {}
        
    def _get_client_identifier(self, request: Request) -> str:
        """
        Obtiene el identificador del cliente (IP).
        
        Args:
            request: Request HTTP
            
        Returns:
            IP del cliente
        """
        # Obtener IP real considerando proxies
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def _clean_old_requests(self, requests: list, current_time: float) -> list:
        """
        Limpia requests antiguas fuera de la ventana de tiempo.
        
        Args:
            requests: Lista de timestamps de requests
            current_time: Timestamp actual
            
        Returns:
            Lista filtrada de requests dentro de la ventana
        """
        window_start = current_time - 60  # 60 segundos
        return [req_time for req_time in requests if req_time > window_start]
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Verifica el rate limit antes de procesar la request.
        
        Args:
            request: Request HTTP entrante
            call_next: Siguiente middleware o endpoint
            
        Returns:
            Response o error 429 si excede el límite
            
        Raises:
            HTTPException 429: Si se excede el rate limit
        """
        # Excluir endpoints de documentación
        if request.url.path in ["/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        client_id = self._get_client_identifier(request)
        current_time = time.time()
        
        # Inicializar o limpiar requests del cliente
        if client_id not in self.request_counts:
            self.request_counts[client_id] = []
        
        self.request_counts[client_id] = self._clean_old_requests(
            self.request_counts[client_id],
            current_time
        )
        
        # Verificar límite
        if len(self.request_counts[client_id]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
                headers={"Retry-After": "60"}
            )
        
        # Registrar request actual
        self.request_counts[client_id].append(current_time)
        
        # Agregar headers informativos
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(
            self.requests_per_minute - len(self.request_counts[client_id])
        )
        
        return response
