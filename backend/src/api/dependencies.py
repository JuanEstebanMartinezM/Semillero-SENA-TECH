"""
Dependencies de FastAPI.

Provee funciones de dependencia para inyectar en los endpoints:
- Sesión de base de datos
- Usuario autenticado actual
- Validación de permisos
"""

from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from db.base import get_db
from services.auth_service import AuthService
from repositories.user_repository import UserRepository
from models.user import User


# Security scheme para JWT
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency para obtener el usuario autenticado actual.
    
    Valida el token JWT y retorna el usuario correspondiente.
    
    Args:
        credentials: Credenciales HTTP Bearer (token JWT)
        db: Sesión de base de datos
        
    Returns:
        Usuario autenticado
        
    Raises:
        HTTPException: Si el token es inválido o el usuario no existe
        
    Example:
        @app.get("/profile")
        def get_profile(current_user: User = Depends(get_current_user)):
            return current_user
    """
    token = credentials.credentials
    
    # Verificar token y obtener user_id
    auth_service = AuthService(db)
    user_id = auth_service.verify_token(token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Obtener usuario de la base de datos
    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency para obtener solo usuarios activos.
    
    Args:
        current_user: Usuario autenticado
        
    Returns:
        Usuario activo
        
    Raises:
        HTTPException: Si el usuario no está activo
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    return current_user
