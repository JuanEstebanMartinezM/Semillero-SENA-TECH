"""
Rutas de autenticación.

Endpoints para:
- Registro de usuarios
- Login
- Refresh token
- Perfil del usuario actual
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from db.base import get_db
from services.auth_service import AuthService
from schemas.user import UserCreate, UserLogin, UserResponse
from schemas.token import Token, RefreshTokenRequest, TokenResponse
from api.dependencies import get_current_user
from models.user import User


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nuevo usuario",
    description="Crea una nueva cuenta de usuario con validación de email y password"
)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
) -> UserResponse:
    """
    Registra un nuevo usuario en el sistema.
    
    **Validaciones:**
    - Email único y formato válido
    - Username único (3-50 caracteres, solo alfanuméricos y -_)
    - Password seguro (mín 8 caracteres, mayúscula, minúscula, número, especial)
    
    Args:
        user_data: Datos del usuario a registrar
        db: Sesión de base de datos
        
    Returns:
        Usuario creado (sin información sensible)
        
    Raises:
        HTTPException 400: Si email o username ya existen
    """
    auth_service = AuthService(db)
    user = auth_service.register(user_data)
    return UserResponse.model_validate(user)


@router.post(
    "/login",
    response_model=Token,
    summary="Iniciar sesión",
    description="Autentica un usuario y genera tokens JWT (access y refresh)"
)
def login(
    request: Request,
    credentials: UserLogin,
    db: Session = Depends(get_db)
) -> Token:
    """
    Inicia sesión con email/username y contraseña.
    
    **Seguridad:**
    - Máximo 5 intentos fallidos antes de bloqueo
    - Bloqueo de cuenta por 30 minutos tras exceder intentos
    - Tokens JWT con expiración (access: 30 min, refresh: 7 días)
    - Logging de eventos de autenticación
    
    Args:
        request: Request HTTP para obtener IP y user agent
        credentials: Email/username y contraseña
        db: Sesión de base de datos
        
    Returns:
        Tokens JWT (access_token, refresh_token)
        
    Raises:
        HTTPException 401: Si las credenciales son inválidas
        HTTPException 403: Si la cuenta está bloqueada o desactivada
    """
    auth_service = AuthService(db)
    
    # Obtener IP y user agent para auditoría
    ip_address = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    tokens, user = auth_service.login(credentials, ip_address, user_agent)
    return tokens


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Renovar access token",
    description="Genera un nuevo access token usando un refresh token válido"
)
def refresh_token(
    token_request: RefreshTokenRequest,
    db: Session = Depends(get_db)
) -> TokenResponse:
    """
    Renueva el access token usando un refresh token.
    
    Útil cuando el access token expira pero el refresh token sigue válido.
    
    Args:
        token_request: Refresh token
        db: Sesión de base de datos
        
    Returns:
        Nuevo access token
        
    Raises:
        HTTPException 401: Refresh token inválido o expirado
    """
    auth_service = AuthService(db)
    new_access_token = auth_service.refresh_access_token(
        token_request.refresh_token
    )
    return TokenResponse(access_token=new_access_token)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Obtener perfil actual",
    description="Retorna la información del usuario autenticado"
)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
) -> UserResponse:
    """
    Obtiene el perfil del usuario autenticado.
    
    Requiere token JWT válido en el header:
    ```
    Authorization: Bearer <access_token>
    ```
    
    Args:
        current_user: Usuario autenticado (inyectado por dependency)
        
    Returns:
        Información del usuario actual
    """
    return UserResponse.model_validate(current_user)


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cerrar sesión",
    description="Invalida el token actual (en producción, agregar a blacklist)"
)
def logout(
    current_user: User = Depends(get_current_user)
):
    """
    Cierra la sesión del usuario actual.
    
    Nota: En esta versión simple, el logout es del lado del cliente
    (eliminar tokens del storage). En producción, se debería implementar
    una blacklist de tokens en Redis o similar.
    
    Args:
        current_user: Usuario autenticado
        
    Returns:
        204 No Content
    """
    # En producción: Agregar token a blacklist en Redis
    # Por ahora, el cliente debe eliminar los tokens
    return None
