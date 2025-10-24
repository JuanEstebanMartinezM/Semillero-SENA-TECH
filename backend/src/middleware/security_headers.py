"""
Middleware para agregar headers de seguridad HTTP.

Implementa mejores prácticas de seguridad web:
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
"""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware que agrega headers de seguridad a todas las respuestas.
    
    Protege contra vulnerabilidades comunes:
    - XSS (Cross-Site Scripting)
    - Clickjacking
    - MIME type sniffing
    - Information disclosure
    """
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Procesa la request y agrega headers de seguridad a la response.
        
        Args:
            request: Request HTTP entrante
            call_next: Siguiente middleware o endpoint
            
        Returns:
            Response con headers de seguridad
        """
        response = await call_next(request)
        
        # Content Security Policy - Más permisivo para desarrollo
        response.headers["Content-Security-Policy"] = (
            "default-src *; "
            "script-src * 'unsafe-inline' 'unsafe-eval'; "
            "style-src * 'unsafe-inline'; "
            "img-src * data: blob:; "
            "font-src *; "
            "connect-src *; "
            "frame-ancestors *;"
        )
        
        # No usar HSTS en desarrollo (solo para HTTPS)
        # response.headers["Strict-Transport-Security"] = (
        #     "max-age=31536000; includeSubDomains"
        # )
        
        # X-Frame-Options - Más permisivo para desarrollo
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        
        # X-Content-Type-Options - Previene MIME sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # X-XSS-Protection - Habilita protección XSS del browser
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Referrer-Policy - Controla información del referrer
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions-Policy - Controla features del browser
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=()"
        )
        
        return response
