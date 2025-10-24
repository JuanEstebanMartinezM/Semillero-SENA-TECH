"""
Rutas para gestión de tareas.

Endpoints CRUD completos con protección IDOR:
- Crear tarea
- Listar tareas del usuario
- Obtener tarea por ID
- Actualizar tarea
- Eliminar tarea
- Marcar como completada
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.base import get_db
from services.task_service import TaskService
from schemas.task import TaskCreate, TaskUpdate, TaskResponse
from api.dependencies import get_current_user
from models.user import User


router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear nueva tarea",
    description="Crea una tarea asociada al usuario autenticado"
)
def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> TaskResponse:
    """
    Crea una nueva tarea para el usuario autenticado.
    
    **Validaciones:**
    - Título requerido (1-200 caracteres)
    - Descripción opcional (máx 1000 caracteres)
    - Prioridad: 1=Low, 2=Medium, 3=High
    - Fecha límite debe ser futura (si se proporciona)
    
    Args:
        task_data: Datos de la tarea a crear
        current_user: Usuario autenticado (inyectado)
        db: Sesión de base de datos
        
    Returns:
        Tarea creada
    """
    task_service = TaskService(db)
    task = task_service.create_task(task_data, current_user.id)
    return TaskResponse.model_validate(task)


@router.get(
    "",
    response_model=List[TaskResponse],
    summary="Listar tareas",
    description="Obtiene todas las tareas del usuario autenticado"
)
def get_all_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[TaskResponse]:
    """
    Lista todas las tareas del usuario autenticado.
    
    Las tareas se ordenan por fecha de creación (más recientes primero).
    
    Args:
        current_user: Usuario autenticado (inyectado)
        db: Sesión de base de datos
        
    Returns:
        Lista de tareas del usuario
    """
    task_service = TaskService(db)
    tasks = task_service.get_all_tasks(current_user.id)
    return [TaskResponse.model_validate(task) for task in tasks]


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Obtener tarea por ID",
    description="Obtiene una tarea específica validando que pertenezca al usuario"
)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> TaskResponse:
    """
    Obtiene una tarea por su ID.
    
    **Seguridad IDOR:**
    - Solo el propietario de la tarea puede acceder a ella
    - Retorna 404 si la tarea no existe o no pertenece al usuario
    
    Args:
        task_id: ID de la tarea
        current_user: Usuario autenticado (inyectado)
        db: Sesión de base de datos
        
    Returns:
        Tarea solicitada
        
    Raises:
        HTTPException 404: Si la tarea no existe o no pertenece al usuario
    """
    task_service = TaskService(db)
    task = task_service.get_task_by_id(task_id, current_user.id)
    return TaskResponse.model_validate(task)


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Actualizar tarea",
    description="Actualiza una tarea existente (actualización parcial permitida)"
)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> TaskResponse:
    """
    Actualiza los datos de una tarea.
    
    **Actualización parcial:**
    - Solo se actualizan los campos proporcionados
    - Los demás campos permanecen sin cambios
    
    **Seguridad IDOR:**
    - Solo el propietario puede actualizar la tarea
    
    Args:
        task_id: ID de la tarea a actualizar
        task_data: Nuevos datos (campos opcionales)
        current_user: Usuario autenticado (inyectado)
        db: Sesión de base de datos
        
    Returns:
        Tarea actualizada
        
    Raises:
        HTTPException 404: Si la tarea no existe o no pertenece al usuario
    """
    task_service = TaskService(db)
    task = task_service.update_task(task_id, task_data, current_user.id)
    return TaskResponse.model_validate(task)


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar tarea",
    description="Elimina una tarea de forma permanente"
)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Elimina una tarea permanentemente.
    
    **Seguridad IDOR:**
    - Solo el propietario puede eliminar la tarea
    
    **Advertencia:**
    - Esta acción es irreversible
    
    Args:
        task_id: ID de la tarea a eliminar
        current_user: Usuario autenticado (inyectado)
        db: Sesión de base de datos
        
    Returns:
        204 No Content
        
    Raises:
        HTTPException 404: Si la tarea no existe o no pertenece al usuario
    """
    task_service = TaskService(db)
    task_service.delete_task(task_id, current_user.id)
    return None


@router.patch(
    "/{task_id}/complete",
    response_model=TaskResponse,
    summary="Marcar tarea como completada",
    description="Marca una tarea como completada y registra la fecha de finalización"
)
def complete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> TaskResponse:
    """
    Marca una tarea como completada.
    
    Actualiza automáticamente:
    - status → "completed"
    - is_completed → True
    - completed_at → fecha y hora actual
    
    **Seguridad IDOR:**
    - Solo el propietario puede completar la tarea
    
    Args:
        task_id: ID de la tarea a completar
        current_user: Usuario autenticado (inyectado)
        db: Sesión de base de datos
        
    Returns:
        Tarea actualizada
        
    Raises:
        HTTPException 404: Si la tarea no existe o no pertenece al usuario
        HTTPException 400: Si la tarea ya está completada
    """
    task_service = TaskService(db)
    task = task_service.mark_task_as_completed(task_id, current_user.id)
    return TaskResponse.model_validate(task)
