"""
Schemas de validación para operaciones con usuarios.

Define las estructuras de datos para requests y responses
relacionados con usuarios, con validaciones exhaustivas.
"""

from datetime import datetime
from typing import Optional
import re

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserBase(BaseModel):
    """Schema base con campos comunes de usuario."""
    
    email: EmailStr = Field(..., description="Email del usuario")
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="Nombre de usuario único"
    )
    full_name: Optional[str] = Field(
        None,
        max_length=100,
        description="Nombre completo del usuario"
    )
    
    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        """
        Valida el formato del username.
        
        Args:
            v: Username a validar
            
        Returns:
            Username validado
            
        Raises:
            ValueError: Si el username no cumple el formato
        """
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError(
                "Username solo puede contener letras, números, guiones y guiones bajos"
            )
        return v.lower()


class UserCreate(UserBase):
    """
    Schema para crear un nuevo usuario.
    
    Incluye validación de contraseña con requisitos de seguridad.
    """
    
    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="Contraseña del usuario"
    )
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """
        Valida que la contraseña cumpla requisitos de seguridad.
        
        Args:
            v: Contraseña a validar
            
        Returns:
            Contraseña validada
            
        Raises:
            ValueError: Si la contraseña no cumple los requisitos
        """
        if not re.search(r"[A-Z]", v):
            raise ValueError("La contraseña debe contener al menos una mayúscula")
        if not re.search(r"[a-z]", v):
            raise ValueError("La contraseña debe contener al menos una minúscula")
        if not re.search(r"\d", v):
            raise ValueError("La contraseña debe contener al menos un número")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError(
                "La contraseña debe contener al menos un carácter especial"
            )
        return v


class UserLogin(BaseModel):
    """
    Schema para login de usuario.
    
    Puede usar email o username para autenticarse.
    """
    
    username: str = Field(..., description="Username o email del usuario")
    password: str = Field(..., description="Contraseña del usuario")


class UserResponse(UserBase):
    """
    Schema para respuesta con datos de usuario.
    
    No incluye información sensible como contraseña.
    """
    
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """
    Schema para actualizar datos de usuario.
    
    Todos los campos son opcionales.
    """
    
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=100)
    
    
class PasswordChange(BaseModel):
    """Schema para cambio de contraseña."""
    
    current_password: str = Field(..., description="Contraseña actual")
    new_password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="Nueva contraseña"
    )
    
    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        """Valida la nueva contraseña con los mismos requisitos que UserCreate."""
        if not re.search(r"[A-Z]", v):
            raise ValueError("La contraseña debe contener al menos una mayúscula")
        if not re.search(r"[a-z]", v):
            raise ValueError("La contraseña debe contener al menos una minúscula")
        if not re.search(r"\d", v):
            raise ValueError("La contraseña debe contener al menos un número")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError(
                "La contraseña debe contener al menos un carácter especial"
            )
        return v
