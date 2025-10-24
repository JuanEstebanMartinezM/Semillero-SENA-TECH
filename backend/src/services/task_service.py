"""
Servicio de gestión de tareas.

Contiene toda la lógica de negocio relacionada con tareas:
- CRUD completo con validación de ownership
- Validaciones de negocio
- Protección IDOR
"""

from typing import List

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from repositories.task_repository import TaskRepository
from schemas.task import TaskCreate, TaskUpdate, TaskResponse
from models.task import Task


class TaskService:
    """
    Servicio de tareas con lógica de negocio.
    
    Implementa Single Responsibility: solo maneja tareas.
    Protege contra IDOR validando que el usuario sea propietario.
    """
    
    def __init__(self, db: Session):
        """
        Inicializa el servicio con repositorio de tareas.
        
        Args:
            db: Sesión de base de datos
        """
        self.task_repo = TaskRepository(db)
    
    def create_task(self, task_data: TaskCreate, user_id: int) -> Task:
        """
        Crea una nueva tarea para el usuario.
        
        Args:
            task_data: Datos de la tarea a crear
            user_id: ID del usuario propietario
            
        Returns:
            Tarea creada
        """
        task = self.task_repo.create(task_data, user_id)
        return task
    
    def get_task_by_id(self, task_id: int, user_id: int) -> Task:
        """
        Obtiene una tarea por ID validando ownership.
        
        Protección IDOR: Solo el propietario puede acceder a su tarea.
        
        Args:
            task_id: ID de la tarea
            user_id: ID del usuario solicitante
            
        Returns:
            Tarea si existe y pertenece al usuario
            
        Raises:
            HTTPException 404: Si la tarea no existe o no pertenece al usuario
        """
        task = self.task_repo.get_by_id_and_user(task_id, user_id)
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tarea no encontrada"
            )
        
        return task
    
    def get_all_tasks(self, user_id: int) -> List[Task]:
        """
        Obtiene todas las tareas del usuario.
        
        Args:
            user_id: ID del usuario
            
        Returns:
            Lista de tareas del usuario
        """
        tasks = self.task_repo.get_all_by_user(user_id)
        return tasks
    
    def update_task(
        self,
        task_id: int,
        task_data: TaskUpdate,
        user_id: int
    ) -> Task:
        """
        Actualiza una tarea validando ownership.
        
        Protección IDOR: Solo el propietario puede actualizar su tarea.
        
        Args:
            task_id: ID de la tarea a actualizar
            task_data: Nuevos datos de la tarea
            user_id: ID del usuario solicitante
            
        Returns:
            Tarea actualizada
            
        Raises:
            HTTPException 404: Si la tarea no existe o no pertenece al usuario
        """
        task = self.get_task_by_id(task_id, user_id)
        updated_task = self.task_repo.update(task, task_data)
        return updated_task
    
    def delete_task(self, task_id: int, user_id: int) -> None:
        """
        Elimina una tarea validando ownership.
        
        Protección IDOR: Solo el propietario puede eliminar su tarea.
        
        Args:
            task_id: ID de la tarea a eliminar
            user_id: ID del usuario solicitante
            
        Raises:
            HTTPException 404: Si la tarea no existe o no pertenece al usuario
        """
        task = self.get_task_by_id(task_id, user_id)
        self.task_repo.delete(task)
    
    def mark_task_as_completed(self, task_id: int, user_id: int) -> Task:
        """
        Marca una tarea como completada validando ownership.
        
        Args:
            task_id: ID de la tarea
            user_id: ID del usuario solicitante
            
        Returns:
            Tarea actualizada
            
        Raises:
            HTTPException 404: Si la tarea no existe o no pertenece al usuario
            HTTPException 400: Si la tarea ya está completada
        """
        task = self.get_task_by_id(task_id, user_id)
        
        if task.is_completed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La tarea ya está completada"
            )
        
        completed_task = self.task_repo.mark_as_completed(task)
        return completed_task
