"""
Servicio de auditoría para logging de eventos de seguridad.

Registra eventos importantes para trazabilidad y análisis:
- Login exitoso/fallido
- Operaciones CRUD en tareas
- Cambios de contraseña
- Accesos denegados
"""

from typing import Optional
from datetime import datetime

from sqlalchemy.orm import Session

from models.audit_log import AuditLog, AuditAction
from models.user import User


class AuditService:
    """
    Servicio para registrar eventos en el audit log.
    
    Centraliza el logging de auditoría para trazabilidad.
    """
    
    def __init__(self, db: Session):
        """
        Inicializa el servicio de auditoría.
        
        Args:
            db: Sesión de base de datos
        """
        self.db = db
    
    def log_event(
        self,
        action: AuditAction,
        user_id: Optional[int] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[int] = None
    ) -> AuditLog:
        """
        Registra un evento en el audit log.
        
        Args:
            action: Tipo de acción realizada
            user_id: ID del usuario (opcional)
            details: Detalles adicionales del evento
            ip_address: Dirección IP del cliente
            user_agent: User agent del navegador
            resource_type: Tipo de recurso afectado
            resource_id: ID del recurso afectado
            
        Returns:
            Registro de auditoría creado
        """
        audit_log = AuditLog(
            action=action,
            user_id=user_id,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            resource_type=resource_type,
            resource_id=resource_id
        )
        
        self.db.add(audit_log)
        self.db.commit()
        self.db.refresh(audit_log)
        
        return audit_log
    
    def log_login_success(
        self,
        user: User,
        ip_address: str,
        user_agent: str
    ) -> AuditLog:
        """
        Registra un login exitoso.
        
        Args:
            user: Usuario que inició sesión
            ip_address: IP del cliente
            user_agent: User agent del navegador
            
        Returns:
            Registro de auditoría
        """
        return self.log_event(
            action=AuditAction.LOGIN_SUCCESS,
            user_id=user.id,
            details=f"Usuario {user.username} inició sesión exitosamente",
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    def log_login_failed(
        self,
        username_or_email: str,
        ip_address: str,
        user_agent: str,
        reason: str = "Credenciales inválidas"
    ) -> AuditLog:
        """
        Registra un intento de login fallido.
        
        Args:
            username_or_email: Username o email usado
            ip_address: IP del cliente
            user_agent: User agent del navegador
            reason: Razón del fallo
            
        Returns:
            Registro de auditoría
        """
        return self.log_event(
            action=AuditAction.LOGIN_FAILED,
            details=f"Intento de login fallido para {username_or_email}: {reason}",
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    def log_task_created(
        self,
        user_id: int,
        task_id: int,
        task_title: str
    ) -> AuditLog:
        """
        Registra la creación de una tarea.
        
        Args:
            user_id: ID del usuario
            task_id: ID de la tarea creada
            task_title: Título de la tarea
            
        Returns:
            Registro de auditoría
        """
        return self.log_event(
            action=AuditAction.CREATE_TASK,
            user_id=user_id,
            details=f"Tarea creada: {task_title}",
            resource_type="task",
            resource_id=task_id
        )
    
    def log_task_updated(
        self,
        user_id: int,
        task_id: int,
        task_title: str
    ) -> AuditLog:
        """
        Registra la actualización de una tarea.
        
        Args:
            user_id: ID del usuario
            task_id: ID de la tarea
            task_title: Título de la tarea
            
        Returns:
            Registro de auditoría
        """
        return self.log_event(
            action=AuditAction.UPDATE_TASK,
            user_id=user_id,
            details=f"Tarea actualizada: {task_title}",
            resource_type="task",
            resource_id=task_id
        )
    
    def log_task_deleted(
        self,
        user_id: int,
        task_id: int,
        task_title: str
    ) -> AuditLog:
        """
        Registra la eliminación de una tarea.
        
        Args:
            user_id: ID del usuario
            task_id: ID de la tarea
            task_title: Título de la tarea
            
        Returns:
            Registro de auditoría
        """
        return self.log_event(
            action=AuditAction.DELETE_TASK,
            user_id=user_id,
            details=f"Tarea eliminada: {task_title}",
            resource_type="task",
            resource_id=task_id
        )
    
    def log_password_changed(
        self,
        user_id: int,
        ip_address: str
    ) -> AuditLog:
        """
        Registra un cambio de contraseña.
        
        Args:
            user_id: ID del usuario
            ip_address: IP del cliente
            
        Returns:
            Registro de auditoría
        """
        return self.log_event(
            action=AuditAction.PASSWORD_CHANGED,
            user_id=user_id,
            details="Contraseña cambiada exitosamente",
            ip_address=ip_address
        )
    
    def log_access_denied(
        self,
        user_id: Optional[int],
        resource_type: str,
        resource_id: Optional[int],
        ip_address: str,
        reason: str
    ) -> AuditLog:
        """
        Registra un acceso denegado (IDOR attempt u otro).
        
        Args:
            user_id: ID del usuario (si está autenticado)
            resource_type: Tipo de recurso
            resource_id: ID del recurso
            ip_address: IP del cliente
            reason: Razón del acceso denegado
            
        Returns:
            Registro de auditoría
        """
        return self.log_event(
            action=AuditAction.ACCESS_DENIED,
            user_id=user_id,
            details=f"Acceso denegado: {reason}",
            ip_address=ip_address,
            resource_type=resource_type,
            resource_id=resource_id
        )
