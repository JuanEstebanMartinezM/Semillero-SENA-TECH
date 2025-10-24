"""
Modelo de Tarea.

Define la estructura de la tabla tasks en la base de datos.
"""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Text, Integer, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import enum

from db.base import Base

if TYPE_CHECKING:
    from models.user import User


class TaskStatus(str, enum.Enum):
    """Estados posibles de una tarea."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class TaskPriority(int, enum.Enum):
    """Prioridades de las tareas."""
    LOW = 1
    MEDIUM = 2
    HIGH = 3


class Task(Base):
    """
    Modelo de tarea del sistema.
    
    Cada tarea pertenece a un usuario específico.
    """
    
    __tablename__ = "tasks"
    
    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Task Details
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Status & Priority
    status: Mapped[TaskStatus] = mapped_column(
        SQLEnum(TaskStatus),
        default=TaskStatus.PENDING,
        nullable=False
    )
    priority: Mapped[TaskPriority] = mapped_column(
        SQLEnum(TaskPriority),
        default=TaskPriority.MEDIUM,
        nullable=False
    )
    
    # Category
    category: Mapped[str] = mapped_column(String(50), nullable=True)
    
    # Completion
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    # Dates
    due_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    
    # Foreign Key
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Relationship
    owner: Mapped["User"] = relationship("User", back_populates="tasks")
    
    def __repr__(self) -> str:
        """Representación en string de la tarea."""
        return f"<Task(id={self.id}, title='{self.title}', status={self.status.value})>"
