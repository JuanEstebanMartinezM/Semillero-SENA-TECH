"""
Módulo de seguridad centralizado.

Gestiona todas las operaciones relacionadas con seguridad:
- Hashing de contraseñas con bcrypt
- Generación y validación de tokens JWT
- Utilidades de seguridad
"""

from datetime import datetime, timedelta
from typing import Dict, Optional, Any

from jose import jwt, JWTError
from passlib.context import CryptContext

from .config import settings


# Contexto de encriptación para passwords
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=settings.bcrypt_rounds
)


class PasswordHasher:
    """
    Gestiona el hashing y verificación de contraseñas.
    
    Usa bcrypt con el número de rounds configurado en settings.
    """
    
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Genera un hash seguro de la contraseña.
        
        Args:
            password: Contraseña en texto plano
            
        Returns:
            Hash de la contraseña
        """
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verifica si la contraseña coincide con el hash.
        
        Args:
            plain_password: Contraseña en texto plano
            hashed_password: Hash almacenado
            
        Returns:
            True si la contraseña es correcta, False en caso contrario
        """
        return pwd_context.verify(plain_password, hashed_password)


class JWTHandler:
    """
    Gestiona la creación y validación de tokens JWT.
    
    Soporta access tokens y refresh tokens con diferentes tiempos de expiración.
    """
    
    @staticmethod
    def create_access_token(
        subject: str,
        additional_claims: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Crea un access token JWT.
        
        Args:
            subject: Identificador del usuario (user_id)
            additional_claims: Claims adicionales a incluir en el token
            
        Returns:
            Token JWT codificado
        """
        expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
        return JWTHandler._create_token(
            subject=subject,
            expires_delta=expires_delta,
            token_type="access",
            additional_claims=additional_claims
        )
    
    @staticmethod
    def create_refresh_token(subject: str) -> str:
        """
        Crea un refresh token JWT.
        
        Args:
            subject: Identificador del usuario (user_id)
            
        Returns:
            Token JWT codificado
        """
        expires_delta = timedelta(days=settings.refresh_token_expire_days)
        return JWTHandler._create_token(
            subject=subject,
            expires_delta=expires_delta,
            token_type="refresh"
        )
    
    @staticmethod
    def _create_token(
        subject: str,
        expires_delta: timedelta,
        token_type: str,
        additional_claims: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Crea un token JWT genérico.
        
        Args:
            subject: Identificador del sujeto
            expires_delta: Tiempo de expiración
            token_type: Tipo de token (access o refresh)
            additional_claims: Claims adicionales
            
        Returns:
            Token JWT codificado
        """
        now = datetime.utcnow()
        expire = now + expires_delta
        
        to_encode = {
            "sub": str(subject),
            "exp": expire,
            "iat": now,
            "type": token_type
        }
        
        if additional_claims:
            to_encode.update(additional_claims)
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.secret_key,
            algorithm=settings.algorithm
        )
        return encoded_jwt
    
    @staticmethod
    def decode_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Decodifica y valida un token JWT.
        
        Args:
            token: Token JWT a decodificar
            
        Returns:
            Payload del token si es válido, None si es inválido o expirado
        """
        try:
            payload = jwt.decode(
                token,
                settings.secret_key,
                algorithms=[settings.algorithm]
            )
            return payload
        except JWTError:
            return None
    
    @staticmethod
    def get_subject_from_token(token: str) -> Optional[str]:
        """
        Extrae el subject (user_id) de un token.
        
        Args:
            token: Token JWT
            
        Returns:
            Subject del token si es válido, None en caso contrario
        """
        payload = JWTHandler.decode_token(token)
        if payload:
            return payload.get("sub")
        return None
    
    @staticmethod
    def validate_token_type(token: str, expected_type: str) -> bool:
        """
        Valida que el token sea del tipo esperado.
        
        Args:
            token: Token JWT
            expected_type: Tipo esperado (access o refresh)
            
        Returns:
            True si el tipo es correcto, False en caso contrario
        """
        payload = JWTHandler.decode_token(token)
        if payload:
            return payload.get("type") == expected_type
        return False


# Instancias globales para uso en la aplicación
password_hasher = PasswordHasher()
jwt_handler = JWTHandler()
