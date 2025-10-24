# 🏦 Davivienda Task Manager - Backend API

Sistema de gestión de tareas empresarial construido con **FastAPI**, diseñado para ofrecer alta performance, seguridad robusta y escalabilidad.

---

## 📋 Tabla de Contenidos

- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Estructura de Carpetas](#-estructura-de-carpetas)
- [Patrones de Diseño](#-patrones-de-diseño)
- [Convenciones de Código](#-convenciones-de-código)
- [Seguridad](#-seguridad)
- [Flujo de Funcionamiento](#-flujo-de-funcionamiento)
- [Instalación](#-instalación)
- [Testing](#-testing)

---

## 🚀 Tecnologías

### Framework Principal

**FastAPI 0.115.5**
- **¿Por qué?**: Framework web moderno y de alto rendimiento para construir APIs
- **Ventajas**: 
  - Validación automática con Pydantic
  - Documentación automática (Swagger/OpenAPI)
  - Async/await nativo para operaciones I/O intensivas
  - Type hints para mejor desarrollo y menos errores

### Base de Datos

**PostgreSQL con SQLAlchemy 2.0**
- **¿Por qué?**: Base de datos relacional robusta y confiable
- **ORM**: SQLAlchemy 2.0 con estilo moderno
- **Ventajas**:
  - ACID compliance para transacciones seguras
  - Migraciones con Alembic
  - Queries eficientes con lazy loading

**Asyncpg**
- Driver asíncrono para PostgreSQL
- Mayor rendimiento en operaciones concurrentes

### Autenticación y Seguridad

**JWT (JSON Web Tokens)**
- Autenticación stateless
- Access tokens de corta duración (30 min)
- Refresh tokens de larga duración (7 días)

**Passlib + Bcrypt**
- Hashing seguro de contraseñas
- Algoritmo bcrypt con salt automático
- Protección contra rainbow tables

**python-jose**
- Generación y validación de JWT
- Algoritmo HS256

### Validación y Serialización

**Pydantic 2.10**
- Validación de datos automática
- Schemas type-safe
- Conversión automática de tipos
- Mensajes de error descriptivos

### Utilidades

**python-dotenv**
- Gestión de variables de entorno
- Configuración por ambiente (dev/prod)

**uvicorn**
- Servidor ASGI de alto rendimiento
- Soporte para async/await
- Hot reload en desarrollo

---

## 🏗️ Arquitectura

### Arquitectura en Capas (Layered Architecture)

```
┌─────────────────────────────────────────┐
│           API Layer (routes)            │  ← Endpoints HTTP
├─────────────────────────────────────────┤
│        Service Layer (services)         │  ← Lógica de negocio
├─────────────────────────────────────────┤
│          CRUD Layer (crud)              │  ← Operaciones DB
├─────────────────────────────────────────┤
│        Data Layer (models)              │  ← Modelos SQLAlchemy
└─────────────────────────────────────────┘
```

**Principios aplicados:**
- **Separation of Concerns**: Cada capa tiene responsabilidad única
- **Dependency Injection**: Inyección de dependencias con FastAPI
- **Single Responsibility**: Cada módulo hace una sola cosa
- **DRY (Don't Repeat Yourself)**: Código reutilizable

---

## 📁 Estructura de Carpetas

```
backend/
├── src/
│   ├── __init__.py
│   ├── main.py                 # Punto de entrada, configuración app
│   │
│   ├── api/                    # 🌐 Capa de API (Endpoints)
│   │   ├── __init__.py
│   │   ├── auth.py            # POST /auth/login, /register, /me
│   │   └── tasks.py           # CRUD de tareas
│   │
│   ├── core/                   # ⚙️ Configuración central
│   │   ├── __init__.py
│   │   ├── config.py          # Variables de entorno, settings
│   │   ├── security.py        # JWT, password hashing
│   │   └── dependencies.py    # Inyección de dependencias
│   │
│   ├── crud/                   # 💾 Operaciones de base de datos
│   │   ├── __init__.py
│   │   ├── base.py            # CRUD genérico (herencia)
│   │   ├── user.py            # CRUD específico de usuarios
│   │   └── task.py            # CRUD específico de tareas
│   │
│   ├── db/                     # 🗄️ Configuración de DB
│   │   ├── __init__.py
│   │   ├── base.py            # Base declarativa SQLAlchemy
│   │   └── session.py         # SessionLocal, engine
│   │
│   ├── models/                 # 🏛️ Modelos SQLAlchemy (Tablas)
│   │   ├── __init__.py
│   │   ├── user.py            # Modelo User (tabla users)
│   │   └── task.py            # Modelo Task (tabla tasks)
│   │
│   ├── schemas/                # 📋 Schemas Pydantic (Validación)
│   │   ├── __init__.py
│   │   ├── user.py            # UserCreate, UserLogin, UserResponse
│   │   └── task.py            # TaskCreate, TaskUpdate, TaskResponse
│   │
│   ├── services/               # 🔧 Lógica de negocio
│   │   ├── __init__.py
│   │   ├── auth_service.py    # Login, register, tokens
│   │   └── task_service.py    # Lógica compleja de tareas
│   │
│   ├── enums/                  # 📌 Enumeraciones
│   │   ├── __init__.py
│   │   └── task_enums.py      # TaskStatus, TaskPriority
│   │
│   └── utils/                  # 🛠️ Utilidades
│       ├── __init__.py
│       ├── password_hasher.py # Funciones de hashing
│       └── security_headers.py # Middleware de seguridad
│
├── tests/                      # 🧪 Tests unitarios
│   └── test_*.py
│
├── .env                        # Variables de entorno
├── requirements.txt            # Dependencias Python
└── README.md                   # Este archivo
```

---

## 🎨 Patrones de Diseño

### 1. **Repository Pattern** (CRUD Layer)

**¿Qué hace?**: Abstrae el acceso a datos de la lógica de negocio

**Implementación**:
```python
# crud/base.py - Repositorio genérico
class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def get(self, db: Session, id: int) -> Optional[ModelType]
    def get_multi(self, db: Session, skip: int, limit: int) -> List[ModelType]
    def create(self, db: Session, obj_in: CreateSchemaType) -> ModelType
    def update(self, db: Session, db_obj: ModelType, obj_in: UpdateSchemaType)
    def delete(self, db: Session, id: int) -> ModelType
```

**Ventaja**: Cambiar la implementación de DB no afecta la lógica de negocio

### 2. **Dependency Injection** (FastAPI)

**¿Qué hace?**: Inyecta dependencias automáticamente en endpoints

**Implementación**:
```python
# core/dependencies.py
def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    # Valida JWT y retorna usuario
```

**Ventaja**: Testing más fácil, código desacoplado

### 3. **Service Layer Pattern**

**¿Qué hace?**: Encapsula lógica de negocio compleja

**Implementación**:
```python
# services/auth_service.py
class AuthService:
    @staticmethod
    def register_user(db: Session, user_data: UserCreate) -> User:
        # 1. Validar que email no exista
        # 2. Hash de contraseña
        # 3. Crear usuario en DB
        # 4. Retornar usuario creado
```

**Ventaja**: Endpoints simples, lógica centralizada

### 4. **Factory Pattern** (Database Session)

**¿Qué hace?**: Crea instancias de sesión de DB

**Implementación**:
```python
# db/session.py
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
```

---

## 📝 Convenciones de Código

### Nomenclatura

**snake_case**: Variables, funciones, módulos
```python
user_repository = UserRepository()
def get_user_by_email(email: str):
```

**PascalCase**: Clases, Schemas, Modelos
```python
class UserCreate(BaseModel):
class TaskService:
```

**UPPER_CASE**: Constantes, Enums
```python
ACCESS_TOKEN_EXPIRE_MINUTES = 30
class TaskStatus(str, Enum):
    PENDING = "pending"
```

### Type Hints Obligatorios

```python
def create_task(
    db: Session,
    task_in: TaskCreate,
    user_id: int
) -> Task:
    # Type hints en parámetros y retorno
```

### Docstrings

```python
def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """
    Autentica usuario con username/email y contraseña.
    
    Args:
        db: Sesión de base de datos
        username: Username o email del usuario
        password: Contraseña en texto plano
        
    Returns:
        User si credenciales válidas, None si no
    """
```

### Clean Code Principles

1. **Funciones pequeñas**: Máximo 20-30 líneas
2. **Un nivel de abstracción**: No mezclar lógica de alto y bajo nivel
3. **Nombres descriptivos**: `get_user_by_email()` no `get_usr()`
4. **Evitar magic numbers**: Usar constantes
5. **Error handling explícito**: Usar HTTPException con mensajes claros

---

## 🔒 Seguridad

### Autenticación JWT

**Flujo de tokens:**

```
1. Login → Access Token (30min) + Refresh Token (7 días)
2. Request → Header: Authorization: Bearer <access_token>
3. Token expirado → Use refresh token → Nuevo access token
4. Logout → Tokens invalidados en cliente
```

**Implementación:**
```python
# core/security.py
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=30))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

### Password Hashing

**Bcrypt con salt automático:**
```python
# utils/password_hasher.py
class PasswordHasher:
    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)
```

### Protección contra ataques

✅ **SQL Injection**: SQLAlchemy ORM parametriza queries
✅ **XSS**: Pydantic sanitiza inputs
✅ **CSRF**: JWT stateless (no cookies)
✅ **Password brute force**: Bcrypt costoso computacionalmente
✅ **CORS**: Configurado para origenes específicos
✅ **Rate limiting**: Puede agregarse con middleware

### Headers de Seguridad

```python
# utils/security_headers.py
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

---

## 🔄 Flujo de Funcionamiento

### Petición HTTP Completa

```
1. Cliente → POST /api/tasks
   Body: {"title": "Nueva tarea", "priority": 2}
   Header: Authorization: Bearer eyJ0eXAi...

2. Middleware de seguridad
   ↓ add_security_headers()
   ↓ CORS validation

3. Router (api/tasks.py)
   ↓ @router.post("/tasks")
   ↓ Validación del schema TaskCreate con Pydantic

4. Dependency Injection
   ↓ get_db() → Sesión de base de datos
   ↓ get_current_user() → Valida JWT, obtiene usuario

5. Endpoint Function
   ↓ create_task_endpoint(task_in, db, current_user)

6. Service Layer (opcional)
   ↓ TaskService.create_task_with_validation()
   ↓ Lógica de negocio compleja

7. CRUD Layer
   ↓ task_repository.create(db, task_in, user_id)
   ↓ SQL: INSERT INTO tasks...

8. Database
   ↓ PostgreSQL ejecuta query
   ↓ Retorna fila creada

9. Response
   ↓ Serialización con Pydantic (TaskResponse)
   ↓ JSON: {"id": 1, "title": "Nueva tarea", ...}

10. Cliente ← 201 Created
```

### Ejemplo Real: Crear Tarea

**Archivo por archivo:**

```python
# 1. api/tasks.py (Endpoint)
@router.post("/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    task_in: TaskCreate,  # ← Schema Pydantic valida body
    db: Session = Depends(get_db),  # ← Inyecta DB session
    current_user: User = Depends(get_current_user)  # ← Valida JWT
) -> Task:
    # Llama al CRUD
    return crud.task.create(db=db, obj_in=task_in, user_id=current_user.id)

# 2. crud/task.py (Operación DB)
def create(self, db: Session, obj_in: TaskCreate, user_id: int) -> Task:
    # Crea instancia del modelo
    db_obj = Task(
        **obj_in.dict(),  # title, description, priority, etc.
        user_id=user_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)  # ← Obtiene ID generado
    return db_obj  # ← Retorna modelo SQLAlchemy

# 3. models/task.py (Tabla DB)
class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))

# 4. schemas/task.py (Validación y Serialización)
class TaskCreate(BaseModel):
    title: str  # ← Valida que exista y sea string
    priority: Optional[int] = 2
    
class TaskResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    
    class Config:
        from_attributes = True  # ← Permite crear desde modelo SQLAlchemy
```

---

## 🚦 Instalación

### Requisitos Previos

- Python 3.11+
- PostgreSQL 14+
- pip o poetry

### Setup

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd backend

# 2. Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 5. Crear base de datos
createdb davivienda_tasks

# 6. Ejecutar migraciones (si existen)
alembic upgrade head

# 7. Iniciar servidor
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Variables de Entorno (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/davivienda_tasks

# Security
SECRET_KEY=tu-clave-super-secreta-aqui-cambiar-en-produccion
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081

# Environment
ENVIRONMENT=development
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
pytest

# Con coverage
pytest --cov=src --cov-report=html

# Test específico
pytest tests/test_auth.py

# Verbose
pytest -v
```

### Estructura de Tests

```python
# tests/test_tasks.py
def test_create_task(client, auth_headers):
    response = client.post(
        "/api/tasks",
        json={"title": "Test task"},
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test task"
```

---

## 📊 Fortalezas de la Plataforma

✅ **Alto Rendimiento**: FastAPI + async/await + PostgreSQL
✅ **Type-Safe**: Type hints + Pydantic = menos errores
✅ **Documentación Automática**: Swagger UI en `/docs`
✅ **Seguridad Robusta**: JWT + Bcrypt + Headers de seguridad
✅ **Escalable**: Arquitectura en capas, fácil de extender
✅ **Testeable**: Dependency injection facilita testing
✅ **Mantenible**: Clean code + patrones de diseño
✅ **DRY**: CRUD genérico reutilizable

---

## 🔗 Endpoints

### Autenticación
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Login (retorna tokens)
- `POST /auth/refresh` - Renovar access token
- `GET /auth/me` - Obtener usuario actual

### Tareas
- `GET /api/tasks` - Listar tareas (paginación + filtros)
- `GET /api/tasks/{id}` - Obtener tarea por ID
- `POST /api/tasks` - Crear tarea
- `PUT /api/tasks/{id}` - Actualizar tarea
- `DELETE /api/tasks/{id}` - Eliminar tarea
- `PATCH /api/tasks/{id}/status` - Cambiar estado
- `PATCH /api/tasks/{id}/complete` - Marcar completada

---

## 📚 Documentación API

Accede a la documentación interactiva:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es propiedad de Davivienda.

---


