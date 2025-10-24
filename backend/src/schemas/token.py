"""
Schemas para tokens JWT y autenticación.

Define las estructuras de datos para tokens de acceso y refresh.
"""

from typing import Optional
from pydantic import BaseModel, Field


class Token(BaseModel):
    """
    Schema para respuesta de autenticación exitosa.
    
    Contiene access token y refresh token.
    """
    
    access_token: str = Field(..., description="Token de acceso JWT")
    refresh_token: str = Field(..., description="Token de refresco JWT")
    token_type: str = Field(default="bearer", description="Tipo de token")


class TokenPayload(BaseModel):
    """
    Schema para el payload decodificado del token JWT.
    
    Contiene la información almacenada en el token.
    """
    
    sub: str = Field(..., description="Subject (user_id)")
    exp: int = Field(..., description="Expiration timestamp")
    iat: int = Field(..., description="Issued at timestamp")
    type: str = Field(..., description="Token type (access o refresh)")


class RefreshTokenRequest(BaseModel):
    """Schema para solicitud de refresh token."""
    
    refresh_token: str = Field(..., description="Refresh token para renovar")


class TokenResponse(BaseModel):
    """Schema para respuesta con nuevo access token."""
    
    access_token: str = Field(..., description="Nuevo access token")
    token_type: str = Field(default="bearer", description="Tipo de token")
