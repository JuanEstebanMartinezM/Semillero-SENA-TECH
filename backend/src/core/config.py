"""
Módulo de configuración centralizada de la aplicación.

Este módulo gestiona todas las variables de entorno y configuraciones
usando Pydantic Settings para validación y type safety.
"""

from typing import List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Configuración principal de la aplicación.
    
    Carga automáticamente las variables desde .env y las valida.
    Todas las configuraciones sensibles deben estar en variables de entorno.
    """
    
    # Application
    app_name: str = Field(default="Task Manager API", alias="APP_NAME")
    app_version: str = Field(default="1.0.0", alias="APP_VERSION")
    debug: bool = Field(default=False, alias="DEBUG")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    
    # Server
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")
    
    # Database
    database_url: str = Field(..., alias="DATABASE_URL")
    
    # Security - JWT
    secret_key: str = Field(..., alias="SECRET_KEY")
    algorithm: str = Field(default="HS256", alias="ALGORITHM")
    access_token_expire_minutes: int = Field(
        default=30, 
        alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    refresh_token_expire_days: int = Field(
        default=7, 
        alias="REFRESH_TOKEN_EXPIRE_DAYS"
    )
    
    # Security - Password
    bcrypt_rounds: int = Field(default=12, alias="BCRYPT_ROUNDS")
    
    # Security - Rate Limiting
    rate_limit_enabled: bool = Field(default=True, alias="RATE_LIMIT_ENABLED")
    rate_limit_times: int = Field(default=100, alias="RATE_LIMIT_TIMES")
    rate_limit_seconds: int = Field(default=60, alias="RATE_LIMIT_SECONDS")
    
    # CORS
    cors_origins: str = Field(
        default="http://localhost:3000", 
        alias="CORS_ORIGINS"
    )
    
    # Account Security
    max_login_attempts: int = Field(default=5, alias="MAX_LOGIN_ATTEMPTS")
    account_lockout_minutes: int = Field(
        default=30, 
        alias="ACCOUNT_LOCKOUT_MINUTES"
    )
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    @field_validator("cors_origins")
    @classmethod
    def parse_cors_origins(cls, v: str) -> List[str]:
        """
        Convierte el string de CORS origins en una lista.
        
        Args:
            v: String con origins separados por comas
            
        Returns:
            Lista de origins permitidos
        """
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @field_validator("bcrypt_rounds")
    @classmethod
    def validate_bcrypt_rounds(cls, v: int) -> int:
        """
        Valida que los rounds de bcrypt sean seguros.
        
        Args:
            v: Número de rounds
            
        Returns:
            Número de rounds validado
            
        Raises:
            ValueError: Si los rounds son menores a 10
        """
        if v < 10:
            raise ValueError("bcrypt_rounds must be at least 10 for security")
        return v
    
    @property
    def is_production(self) -> bool:
        """Verifica si el ambiente es producción."""
        return self.environment.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Verifica si el ambiente es desarrollo."""
        return self.environment.lower() == "development"


# Singleton de configuración
settings = Settings()
