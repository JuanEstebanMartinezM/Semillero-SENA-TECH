"""
Schemas de validación para operaciones con tareas.

Define las estructuras de datos para requests y responses
relacionados con tareas, con validaciones exhaustivas.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from models.task import TaskStatus, TaskPriority


class TaskBase(BaseModel):
    """Schema base con campos comunes de tarea."""
    
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Título de la tarea"
    )
    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Descripción detallada de la tarea"
    )
    category: Optional[str] = Field(
        None,
        max_length=50,
        description="Categoría de la tarea"
    )
    priority: TaskPriority = Field(
        default=TaskPriority.MEDIUM,
        description="Prioridad: 1=Low, 2=Medium, 3=High"
    )
    due_date: Optional[datetime] = Field(
        None,
        description="Fecha límite de la tarea"
    )
    
    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        """
        Valida y limpia el título.
        
        Args:
            v: Título a validar
            
        Returns:
            Título validado y limpiado
            
        Raises:
            ValueError: Si el título está vacío o solo tiene espacios
        """
        v = v.strip()
        if not v:
            raise ValueError("El título no puede estar vacío")
        return v
    



class TaskCreate(TaskBase):
    """
    Schema para crear una nueva tarea.
    
    Hereda todos los campos de TaskBase.
    """
    
    @field_validator("due_date")
    @classmethod
    def validate_due_date(cls, v: Optional[datetime]) -> Optional[datetime]:
        """
        Valida que la fecha límite sea futura.
        
        Args:
            v: Fecha a validar
            
        Returns:
            Fecha validada
            
        Raises:
            ValueError: Si la fecha es pasada
        """
        if v and v < datetime.utcnow():
            raise ValueError("La fecha límite debe ser futura")
        return v


class TaskUpdate(BaseModel):
    """
    Schema para actualizar una tarea.
    
    Todos los campos son opcionales para actualizaciones parciales.
    """
    
    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=200,
        description="Título de la tarea"
    )
    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Descripción de la tarea"
    )
    category: Optional[str] = Field(
        None,
        max_length=50,
        description="Categoría de la tarea"
    )
    status: Optional[TaskStatus] = Field(
        None,
        description="Estado: pending, in_progress, completed"
    )
    priority: Optional[TaskPriority] = Field(
        None,
        description="Prioridad: 1=Low, 2=Medium, 3=High"
    )
    due_date: Optional[datetime] = Field(
        None,
        description="Fecha límite de la tarea"
    )
    
    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        """Valida y limpia el título si se proporciona."""
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("El título no puede estar vacío")
        return v
    
    @field_validator("due_date")
    @classmethod
    def validate_due_date(cls, v: Optional[datetime]) -> Optional[datetime]:
        """Valida que la fecha límite sea futura si se proporciona."""
        if v and v < datetime.utcnow():
            raise ValueError("La fecha límite debe ser futura")
        return v


class TaskResponse(TaskBase):
    """
    Schema para respuesta con datos de tarea.
    
    Incluye campos adicionales del modelo.
    """
    
    id: int
    status: TaskStatus
    is_completed: bool
    completed_at: Optional[datetime] = None
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class TaskListResponse(BaseModel):
    """
    Schema para respuesta de lista paginada de tareas.
    
    Incluye metadata de paginación.
    """
    
    items: list[TaskResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    
    model_config = {"from_attributes": True}
