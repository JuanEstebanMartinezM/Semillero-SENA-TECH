"""
Rutas para gestión de tareas.

Endpoints CRUD completos con protección IDOR:
- Crear tarea
- Listar tareas del usuario (con filtros y paginación)
- Obtener tarea por ID
- Actualizar tarea
- Eliminar tarea
- Marcar como completada
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from db.base import get_db
from services.task_service import TaskService
from schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from api.dependencies import get_current_user
from models.user import User
from models.task import TaskStatus, TaskPriority


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
    response_model=TaskListResponse,
    summary="Listar tareas con filtros y paginación",
    description="Obtiene tareas del usuario con filtros, búsqueda y paginación"
)
def get_all_tasks(
    status_filter: Optional[TaskStatus] = Query(None, description="Filtrar por estado"),
    priority: Optional[TaskPriority] = Query(None, description="Filtrar por prioridad"),
    category: Optional[str] = Query(None, description="Filtrar por categoría"),
    is_completed: Optional[bool] = Query(None, description="Filtrar por completado"),
    search: Optional[str] = Query(None, description="Buscar en título/descripción"),
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(10, ge=1, le=100, description="Tamaño de página"),
    sort_by: str = Query("created_at", description="Campo para ordenar"),
    order: str = Query("desc", regex="^(asc|desc)$", description="Orden asc/desc"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> TaskListResponse:
    """
    Lista tareas del usuario con filtros y paginación.
    
    **Filtros disponibles:**
    - status: pending, in_progress, completed
    - priority: 1 (Low), 2 (Medium), 3 (High)
    - category: Categoría personalizada
    - is_completed: true/false
    - search: Busca en título y descripción
    
    **Paginación:**
    - page: Número de página (mínimo 1)
    - page_size: Tamaño de página (1-100, default 10)
    
    **Ordenamiento:**
    - sort_by: created_at, due_date, priority, title, etc.
    - order: asc (ascendente) o desc (descendente)
    
    Args:
        status_filter: Filtro por estado
        priority: Filtro por prioridad
        category: Filtro por categoría
        is_completed: Filtro por completado
        search: Búsqueda de texto
        page: Número de página
        page_size: Registros por página
        sort_by: Campo de ordenamiento
        order: Dirección del ordenamiento
        current_user: Usuario autenticado
        db: Sesión de base de datos
        
    Returns:
        Respuesta con lista de tareas y metadata de paginación
    """
    task_service = TaskService(db)
    return task_service.get_filtered_tasks(
        user_id=current_user.id,
        status_filter=status_filter,
        priority=priority,
        category=category,
        is_completed=is_completed,
        search=search,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        order=order
    )


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
