"""
Servicio de autenticación.

Contiene toda la lógica de negocio relacionada con autenticación:
- Registro de usuarios
- Login y logout
- Gestión de tokens JWT
- Validación de credenciales
- Bloqueo de cuentas por seguridad
"""

from datetime import datetime, timedelta
from typing import Optional, Tuple

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from core.security import password_hasher, jwt_handler
from core.config import settings
from repositories.user_repository import UserRepository
from schemas.user import UserCreate, UserLogin
from schemas.token import Token
from models.user import User
from services.audit_service import AuditService


class AuthService:
    """
    Servicio de autenticación con lógica de negocio.
    
    Implementa Single Responsibility: solo maneja autenticación.
    """
    
    def __init__(self, db: Session):
        """
        Inicializa el servicio con repositorio de usuarios.
        
        Args:
            db: Sesión de base de datos
        """
        self.user_repo = UserRepository(db)
        self.audit_service = AuditService(db)
    
    def register(self, user_data: UserCreate) -> User:
        """
        Registra un nuevo usuario en el sistema.
        
        Args:
            user_data: Datos del usuario a registrar
            
        Returns:
            Usuario creado
            
        Raises:
            HTTPException: Si el email o username ya existen
        """
        # Validar que el email no exista
        if self.user_repo.get_by_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )
        
        # Validar que el username no exista
        if self.user_repo.get_by_username(user_data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El username ya está registrado"
            )
        
        # Hashear la contraseña
        hashed_password = password_hasher.hash_password(user_data.password)
        
        # Crear el usuario
        user = self.user_repo.create(user_data, hashed_password)
        
        return user
    
    def login(self, credentials: UserLogin, ip_address: str = "unknown", user_agent: str = "unknown") -> Tuple[Token, User]:
        """
        Autentica un usuario y genera tokens JWT.
        
        Args:
            credentials: Credenciales de login (username/email y password)
            ip_address: Dirección IP del cliente
            user_agent: User agent del navegador
            
        Returns:
            Tupla con (tokens JWT, usuario autenticado)
            
        Raises:
            HTTPException: Si las credenciales son inválidas o la cuenta está bloqueada
        """
        # Buscar usuario por email o username
        user = self.user_repo.get_by_email_or_username(credentials.username)
        
        if not user:
            # Log de intento fallido
            self.audit_service.log_login_failed(
                credentials.username,
                ip_address,
                user_agent,
                "Usuario no encontrado"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )
        
        # Verificar si la cuenta está bloqueada
        if self.user_repo.is_account_locked(user):
            self.audit_service.log_login_failed(
                credentials.username,
                ip_address,
                user_agent,
                "Cuenta bloqueada"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Cuenta bloqueada hasta {user.locked_until}. "
                       f"Demasiados intentos de login fallidos."
            )
        
        # Verificar la contraseña
        if not password_hasher.verify_password(
            credentials.password,
            user.hashed_password
        ):
            # Incrementar intentos fallidos
            user = self.user_repo.increment_failed_login(user)
            
            # Bloquear cuenta si alcanza el máximo de intentos
            if user.failed_login_attempts >= settings.max_login_attempts:
                locked_until = datetime.utcnow() + timedelta(
                    minutes=settings.account_lockout_minutes
                )
                self.user_repo.lock_account(user, locked_until)
                
                self.audit_service.log_login_failed(
                    credentials.username,
                    ip_address,
                    user_agent,
                    f"Cuenta bloqueada por {settings.account_lockout_minutes} minutos"
                )
                
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Cuenta bloqueada por {settings.account_lockout_minutes} "
                           f"minutos debido a múltiples intentos fallidos."
                )
            
            # Log de intento fallido
            self.audit_service.log_login_failed(
                credentials.username,
                ip_address,
                user_agent,
                "Contraseña incorrecta"
            )
            
            # Mostrar intentos restantes
            remaining_attempts = settings.max_login_attempts - user.failed_login_attempts
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Credenciales inválidas. "
                       f"Intentos restantes: {remaining_attempts}"
            )
        
        # Verificar que la cuenta esté activa
        if not user.is_active:
            self.audit_service.log_login_failed(
                credentials.username,
                ip_address,
                user_agent,
                "Cuenta desactivada"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cuenta desactivada"
            )
        
        # Actualizar último login
        user = self.user_repo.update_last_login(user)
        
        # Log de login exitoso
        self.audit_service.log_login_success(user, ip_address, user_agent)
        
        # Generar tokens
        tokens = self._generate_tokens(user)
        
        return tokens, user
    
    def refresh_access_token(self, refresh_token: str) -> str:
        """
        Genera un nuevo access token usando un refresh token válido.
        
        Args:
            refresh_token: Refresh token válido
            
        Returns:
            Nuevo access token
            
        Raises:
            HTTPException: Si el token es inválido o ha expirado
        """
        # Validar que sea un refresh token
        if not jwt_handler.validate_token_type(refresh_token, "refresh"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        
        # Extraer user_id del token
        user_id = jwt_handler.get_subject_from_token(refresh_token)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o expirado"
            )
        
        # Verificar que el usuario exista
        user = self.user_repo.get_by_id(int(user_id))
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado o inactivo"
            )
        
        # Generar nuevo access token
        new_access_token = jwt_handler.create_access_token(str(user.id))
        
        return new_access_token
    
    def _generate_tokens(self, user: User) -> Token:
        """
        Genera access y refresh tokens para un usuario.
        
        Args:
            user: Usuario autenticado
            
        Returns:
            Objeto Token con ambos tokens
        """
        access_token = jwt_handler.create_access_token(
            subject=str(user.id),
            additional_claims={"username": user.username}
        )
        refresh_token = jwt_handler.create_refresh_token(subject=str(user.id))
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
    
    def verify_token(self, token: str) -> Optional[int]:
        """
        Verifica un access token y retorna el user_id.
        
        Args:
            token: Access token a verificar
            
        Returns:
            User ID si el token es válido, None en caso contrario
        """
        if not jwt_handler.validate_token_type(token, "access"):
            return None
        
        user_id = jwt_handler.get_subject_from_token(token)
        return int(user_id) if user_id else None
