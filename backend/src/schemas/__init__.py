"""
Exportación centralizada de todos los schemas.

Facilita los imports en otras partes de la aplicación.
"""

from schemas.user import (
    UserBase,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
    PasswordChange,
)
from schemas.token import (
    Token,
    TokenPayload,
    RefreshTokenRequest,
    TokenResponse,
)
from schemas.task import (
    TaskBase,
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
)

__all__ = [
    # User schemas
    "UserBase",
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "UserUpdate",
    "PasswordChange",
    # Token schemas
    "Token",
    "TokenPayload",
    "RefreshTokenRequest",
    "TokenResponse",
    # Task schemas
    "TaskBase",
    "TaskCreate",
    "TaskUpdate",
    "TaskResponse",
    "TaskListResponse",
]
