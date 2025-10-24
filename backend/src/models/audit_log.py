"""
Modelo de Log de Auditoría.

Registra todas las acciones importantes del sistema para seguridad y trazabilidad.
"""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import enum

from db.base import Base

if TYPE_CHECKING:
    from models.user import User


class AuditAction(str, enum.Enum):
    """Tipos de acciones auditables."""
    # Authentication
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILED = "login_failed"
    LOGOUT = "logout"
    REGISTER = "register"
    REFRESH_TOKEN = "refresh_token"
    
    # Tasks
    CREATE_TASK = "create_task"
    UPDATE_TASK = "update_task"
    DELETE_TASK = "delete_task"
    COMPLETE_TASK = "complete_task"
    
    # Account
    UPDATE_PROFILE = "update_profile"
    CHANGE_PASSWORD = "change_password"
    ACCOUNT_LOCKED = "account_locked"


class AuditLog(Base):
    """
    Modelo de log de auditoría.
    
    Registra todas las acciones importantes para trazabilidad y seguridad.
    """
    
    __tablename__ = "audit_logs"
    
    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Action Details
    action: Mapped[AuditAction] = mapped_column(
        SQLEnum(AuditAction),
        nullable=False,
        index=True
    )
    details: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Request Info
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)  # IPv6 compatible
    user_agent: Mapped[str] = mapped_column(String(500), nullable=True)
    
    # Resource Info
    resource_type: Mapped[str] = mapped_column(String(50), nullable=True)
    resource_id: Mapped[int] = mapped_column(Integer, nullable=True)
    
    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )
    
    # Foreign Key
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,  # Nullable para permitir logs de usuarios no autenticados
        index=True
    )
    
    # Relationship
    user: Mapped["User"] = relationship("User", back_populates="audit_logs")
    
    def __repr__(self) -> str:
        """Representación en string del log."""
        return f"<AuditLog(id={self.id}, action={self.action.value}, user_id={self.user_id})>"
