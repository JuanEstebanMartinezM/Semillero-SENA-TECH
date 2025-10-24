"""
Repositorio para operaciones de base de datos con tareas.

Implementa el patrón Repository para separar la lógica de acceso a datos.
Todas las queries SQL están encapsuladas aquí.
"""

from typing import Optional, List, Tuple
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from models.task import Task, TaskStatus, TaskPriority
from schemas.task import TaskCreate, TaskUpdate


class TaskRepository:
    """
    Repositorio para gestionar operaciones CRUD de tareas.
    
    Sigue el patrón Repository para abstraer el acceso a datos.
    """
    
    def __init__(self, db: Session):
        """
        Inicializa el repositorio con una sesión de base de datos.
        
        Args:
            db: Sesión de SQLAlchemy
        """
        self.db = db
    
    def get_by_id(self, task_id: int) -> Optional[Task]:
        """
        Obtiene una tarea por su ID.
        
        Args:
            task_id: ID de la tarea
            
        Returns:
            Tarea si existe, None en caso contrario
        """
        return self.db.query(Task).filter(Task.id == task_id).first()
    
    def get_by_id_and_user(
        self,
        task_id: int,
        user_id: int
    ) -> Optional[Task]:
        """
        Obtiene una tarea por ID verificando que pertenezca al usuario.
        
        Protección IDOR: valida ownership.
        
        Args:
            task_id: ID de la tarea
            user_id: ID del usuario propietario
            
        Returns:
            Tarea si existe y pertenece al usuario, None en caso contrario
        """
        return self.db.query(Task).filter(
            and_(Task.id == task_id, Task.user_id == user_id)
        ).first()
    
    def get_all_by_user(self, user_id: int) -> List[Task]:
        """
        Obtiene todas las tareas de un usuario.
        
        Args:
            user_id: ID del usuario
            
        Returns:
            Lista de tareas del usuario
        """
        return self.db.query(Task).filter(
            Task.user_id == user_id
        ).order_by(Task.created_at.desc()).all()
    
    def create(self, task_data: TaskCreate, user_id: int) -> Task:
        """
        Crea una nueva tarea en la base de datos.
        
        Args:
            task_data: Datos de la tarea a crear
            user_id: ID del usuario propietario
            
        Returns:
            Tarea creada
        """
        db_task = Task(
            title=task_data.title,
            description=task_data.description,
            category=task_data.category,
            priority=task_data.priority,
            due_date=task_data.due_date,
            status=TaskStatus.PENDING,
            is_completed=False,
            user_id=user_id,
        )
        self.db.add(db_task)
        self.db.commit()
        self.db.refresh(db_task)
        return db_task
    
    def update(self, task: Task, task_data: TaskUpdate) -> Task:
        """
        Actualiza los datos de una tarea.
        
        Args:
            task: Tarea a actualizar
            task_data: Nuevos datos de la tarea
            
        Returns:
            Tarea actualizada
        """
        update_data = task_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)
        
        # Si se marca como completada, actualizar campos relacionados
        if "status" in update_data and update_data["status"] == TaskStatus.COMPLETED:
            task.is_completed = True
            task.completed_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(task)
        return task
    
    def delete(self, task: Task) -> None:
        """
        Elimina una tarea de la base de datos.
        
        Args:
            task: Tarea a eliminar
        """
        self.db.delete(task)
        self.db.commit()
    
    def mark_as_completed(self, task: Task) -> Task:
        """
        Marca una tarea como completada.
        
        Args:
            task: Tarea a completar
            
        Returns:
            Tarea actualizada
        """
        task.status = TaskStatus.COMPLETED
        task.is_completed = True
        task.completed_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(task)
        return task
    
    def count_by_user(self, user_id: int) -> int:
        """
        Cuenta el total de tareas de un usuario.
        
        Args:
            user_id: ID del usuario
            
        Returns:
            Número total de tareas
        """
        return self.db.query(Task).filter(Task.user_id == user_id).count()
    
    def count_completed_by_user(self, user_id: int) -> int:
        """
        Cuenta las tareas completadas de un usuario.
        
        Args:
            user_id: ID del usuario
            
        Returns:
            Número de tareas completadas
        """
        return self.db.query(Task).filter(
            and_(Task.user_id == user_id, Task.is_completed == True)
        ).count()
    
    def count_pending_by_user(self, user_id: int) -> int:
        """
        Cuenta las tareas pendientes de un usuario.
        
        Args:
            user_id: ID del usuario
            
        Returns:
            Número de tareas pendientes
        """
        return self.db.query(Task).filter(
            and_(Task.user_id == user_id, Task.is_completed == False)
        ).count()
    
    def get_filtered(
        self,
        user_id: int,
        status: Optional[TaskStatus] = None,
        priority: Optional[TaskPriority] = None,
        category: Optional[str] = None,
        is_completed: Optional[bool] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 10,
        sort_by: str = "created_at",
        order: str = "desc"
    ) -> Tuple[List[Task], int]:
        """
        Obtiene tareas filtradas y paginadas.
        
        Args:
            user_id: ID del usuario
            status: Filtrar por estado
            priority: Filtrar por prioridad
            category: Filtrar por categoría
            is_completed: Filtrar por completado
            search: Buscar en título y descripción
            skip: Número de registros a saltar
            limit: Límite de registros
            sort_by: Campo para ordenar
            order: Orden ascendente o descendente
            
        Returns:
            Tupla con lista de tareas y total de registros
        """
        query = self.db.query(Task).filter(Task.user_id == user_id)
        
        # Aplicar filtros
        if status is not None:
            query = query.filter(Task.status == status)
        
        if priority is not None:
            query = query.filter(Task.priority == priority)
        
        if category is not None:
            query = query.filter(Task.category == category)
        
        if is_completed is not None:
            query = query.filter(Task.is_completed == is_completed)
        
        # Búsqueda en título y descripción
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Task.title.ilike(search_pattern),
                    Task.description.ilike(search_pattern)
                )
            )
        
        # Contar total antes de paginar
        total = query.count()
        
        # Ordenamiento
        sort_column = getattr(Task, sort_by, Task.created_at)
        if order.lower() == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())
        
        # Paginación
        tasks = query.offset(skip).limit(limit).all()
        
        return tasks, total
