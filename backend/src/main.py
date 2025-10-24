"""
Punto de entrada de la aplicación FastAPI.

Configura:
- Aplicación FastAPI con metadata
- CORS middleware
- Security middlewares
- Rate limiting
- Routers de la API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from api.routes import auth, tasks
from middleware.security_headers import SecurityHeadersMiddleware
from middleware.rate_limit import RateLimitMiddleware


# Crear aplicación FastAPI
app = FastAPI(
    title="Davivienda Task Manager API",
    description="API REST para gestión de tareas con autenticación JWT y seguridad avanzada",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware de seguridad
app.add_middleware(SecurityHeadersMiddleware)

# Middleware de rate limiting
app.add_middleware(
    RateLimitMiddleware,
    requests_per_minute=60
)

# Incluir routers
app.include_router(auth.router)
app.include_router(tasks.router)


@app.get("/")
def root():
    """
    Endpoint raíz de la API.
    
    Returns:
        Información básica de la API
    """
    return {
        "message": "Davivienda Task Manager API",
        "version": "1.0.0",
        "docs": "/docs" if settings.debug else None
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint para monitoreo.
    
    Returns:
        Estado de la aplicación
    """
    return {
        "status": "healthy",
        "service": "task-manager-api"
    }
