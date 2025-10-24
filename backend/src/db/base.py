"""
Módulo de configuración de la base de datos.

Gestiona la conexión a PostgreSQL usando SQLAlchemy 2.0
y proporciona la base declarativa para los modelos.
"""

from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session

from core.config import settings


# Engine de SQLAlchemy
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # Verifica conexiones antes de usarlas
    pool_size=10,        # Número de conexiones en el pool
    max_overflow=20,     # Conexiones adicionales permitidas
    echo=settings.debug  # Log de queries SQL en modo debug
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


class Base(DeclarativeBase):
    """
    Clase base declarativa para todos los modelos SQLAlchemy.
    
    Todos los modelos deben heredar de esta clase.
    """
    pass


def get_db() -> Generator[Session, None, None]:
    """
    Dependency para obtener una sesión de base de datos.
    
    Esta función se usa con FastAPI's Depends() para inyectar
    la sesión de DB en los endpoints.
    
    Yields:
        Session: Sesión de base de datos
        
    Example:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Inicializa la base de datos creando todas las tablas.
    
    Esta función solo se debe usar en desarrollo.
    En producción, usar Alembic para migraciones.
    """
    Base.metadata.create_all(bind=engine)
