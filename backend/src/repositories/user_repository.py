"""
Repositorio para operaciones de base de datos con usuarios.

Implementa el patrón Repository para separar la lógica de acceso a datos.
Todas las queries SQL están encapsuladas aquí.
"""

from typing import Optional
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import or_

from models.user import User
from schemas.user import UserCreate, UserUpdate


class UserRepository:
    """
    Repositorio para gestionar operaciones CRUD de usuarios.
    
    Sigue el patrón Repository para abstraer el acceso a datos.
    """
    
    def __init__(self, db: Session):
        """
        Inicializa el repositorio con una sesión de base de datos.
        
        Args:
            db: Sesión de SQLAlchemy
        """
        self.db = db
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        """
        Obtiene un usuario por su ID.
        
        Args:
            user_id: ID del usuario
            
        Returns:
            Usuario si existe, None en caso contrario
        """
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_by_email(self, email: str) -> Optional[User]:
        """
        Obtiene un usuario por su email.
        
        Args:
            email: Email del usuario
            
        Returns:
            Usuario si existe, None en caso contrario
        """
        return self.db.query(User).filter(User.email == email).first()
    
    def get_by_username(self, username: str) -> Optional[User]:
        """
        Obtiene un usuario por su username.
        
        Args:
            username: Username del usuario
            
        Returns:
            Usuario si existe, None en caso contrario
        """
        return self.db.query(User).filter(User.username == username).first()
    
    def get_by_email_or_username(self, identifier: str) -> Optional[User]:
        """
        Obtiene un usuario por email o username.
        
        Args:
            identifier: Email o username del usuario
            
        Returns:
            Usuario si existe, None en caso contrario
        """
        return self.db.query(User).filter(
            or_(User.email == identifier, User.username == identifier)
        ).first()
    
    def create(self, user_data: UserCreate, hashed_password: str) -> User:
        """
        Crea un nuevo usuario en la base de datos.
        
        Args:
            user_data: Datos del usuario a crear
            hashed_password: Contraseña hasheada
            
        Returns:
            Usuario creado
        """
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            is_active=True,
            is_verified=False,
            failed_login_attempts=0,
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
    
    def update(self, user: User, user_data: UserUpdate) -> User:
        """
        Actualiza los datos de un usuario.
        
        Args:
            user: Usuario a actualizar
            user_data: Nuevos datos del usuario
            
        Returns:
            Usuario actualizado
        """
        update_data = user_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def update_password(self, user: User, hashed_password: str) -> User:
        """
        Actualiza la contraseña de un usuario.
        
        Args:
            user: Usuario a actualizar
            hashed_password: Nueva contraseña hasheada
            
        Returns:
            Usuario actualizado
        """
        user.hashed_password = hashed_password
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def update_last_login(self, user: User) -> User:
        """
        Actualiza la fecha del último login.
        
        Args:
            user: Usuario a actualizar
            
        Returns:
            Usuario actualizado
        """
        user.last_login = datetime.utcnow()
        user.failed_login_attempts = 0  # Resetear intentos fallidos
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def increment_failed_login(self, user: User) -> User:
        """
        Incrementa el contador de intentos de login fallidos.
        
        Args:
            user: Usuario a actualizar
            
        Returns:
            Usuario actualizado
        """
        user.failed_login_attempts += 1
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def lock_account(self, user: User, locked_until: datetime) -> User:
        """
        Bloquea la cuenta del usuario hasta una fecha específica.
        
        Args:
            user: Usuario a bloquear
            locked_until: Fecha hasta la cual estará bloqueado
            
        Returns:
            Usuario actualizado
        """
        user.locked_until = locked_until
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def unlock_account(self, user: User) -> User:
        """
        Desbloquea la cuenta del usuario.
        
        Args:
            user: Usuario a desbloquear
            
        Returns:
            Usuario actualizado
        """
        user.locked_until = None
        user.failed_login_attempts = 0
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def is_account_locked(self, user: User) -> bool:
        """
        Verifica si la cuenta del usuario está bloqueada.
        
        Args:
            user: Usuario a verificar
            
        Returns:
            True si está bloqueada, False en caso contrario
        """
        if user.locked_until is None:
            return False
        
        # Si la fecha de bloqueo ya pasó, desbloquear automáticamente
        if user.locked_until < datetime.utcnow():
            self.unlock_account(user)
            return False
        
        return True
