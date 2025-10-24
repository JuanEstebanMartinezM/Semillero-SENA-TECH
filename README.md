# 🏦 Davivienda Task Manager

Sistema completo de gestión de tareas empresarial con backend API, frontend web y aplicación móvil.

---

## 📋 Stack Tecnológico

### Backend
- **Python 3.11+**
- **PostgreSQL 14+**
- **FastAPI** - API REST

### Frontend Web
- **Node.js 18+**
- **React 18** + **TypeScript**
- **Vite** + **Tailwind CSS**

### Mobile
- **Node.js 18+**
- **React Native** + **Expo**
- **TypeScript**

---

## 🚀 Instalación Rápida (Script Automático)

### Linux/Mac

```bash
# Dar permisos de ejecución
chmod +x setup.sh

# Ejecutar instalación y arranque
./setup.sh
```

El script automáticamente:
1. ✅ Verifica dependencias (Python, Node.js, PostgreSQL)
2. ✅ Crea base de datos
3. ✅ Instala dependencias de backend
4. ✅ Instala dependencias de frontend web
5. ✅ Instala dependencias de mobile
6. ✅ Configura variables de entorno
7. ✅ Inicia los 3 servidores en terminales separadas

---

## 📦 Instalación Manual

### Requisitos Previos

- **Python 3.11+**
- **Node.js 18+** y npm
- **PostgreSQL 14+**
- **Git**

### 1. Clonar Repositorio

```bash
git clone https://github.com/JuanEstebanMartinezM/Semillero-SENA-TECH.git
cd Semillero-SENA-TECH
```

### 2. Backend (FastAPI)

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Instalar dependencias
pip install -r requirements.txt

# Crear base de datos PostgreSQL
createdb davivienda_tasks
# O manualmente:
# psql -U postgres
# CREATE DATABASE davivienda_tasks;

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar servidor
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend corriendo en:** `http://localhost:8000`

### 3. Frontend Web (React)

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# VITE_API_URL=http://localhost:8000

# Iniciar servidor de desarrollo
npm run dev
```

**Frontend Web corriendo en:** `http://localhost:3000`

### 4. Mobile (React Native + Expo)

```bash
cd mobile

# Instalar dependencias
npm install

# Configurar API URL en app.config.js
# Cambiar IP por tu IP local

# Iniciar Expo
npx expo start

# Escanear QR con Expo Go app
# iOS: App de Cámara
# Android: Expo Go app
```

**Mobile:** Escanea QR code con tu dispositivo

---

## 🔧 Configuración

### Variables de Entorno

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/davivienda_tasks
SECRET_KEY=tu-clave-secreta-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Frontend Web (.env)
```env
VITE_API_URL=http://localhost:8000
```

#### Mobile (app.config.js)
```javascript
extra: {
  apiUrl: "http://TU_IP_LOCAL:8000"  // Ej: http://192.168.1.4:8000
}
```

**Obtener tu IP local:**
```bash
# Linux/Mac
hostname -I | awk '{print $1}'

# Windows
ipconfig  # Buscar IPv4 Address
```

---

## 📱 Uso

### Acceder a las Aplicaciones

1. **Backend API:** http://localhost:8000/docs (Swagger UI)
2. **Frontend Web:** http://localhost:3000
3. **Mobile:** Expo Go app en tu teléfono

### Credenciales de Prueba

Crea tu usuario en `/register` o usa:
- **Email:** demo@davivienda.com
- **Password:** Demo123!

---

## 📚 Documentación Completa

- [Backend README](./backend/README.md) - API, arquitectura, seguridad
- [Frontend README](./frontend/README.md) - Web app, componentes, hooks
- [Mobile README](./mobile/README.md) - App móvil, navegación, deployment

---

## 🛠️ Scripts Útiles

### Backend
```bash
# Tests
pytest

# Linting
ruff check src/

# Formateo
black src/
```

### Frontend/Mobile
```bash
# Tests
npm run test

# Build producción
npm run build

# Linting
npm run lint
```

---

## 🏗️ Estructura del Proyecto

```
DAVIVIENDA/
├── backend/          # API FastAPI + PostgreSQL
│   ├── src/
│   ├── tests/
│   └── requirements.txt
│
├── frontend/         # Web App React + TypeScript
│   ├── src/
│   ├── public/
│   └── package.json
│
├── mobile/           # Mobile App React Native + Expo
│   ├── src/
│   ├── assets/
│   └── package.json
│
├── setup.sh          # Script de instalación automática
├── LICENSE           # Licencia MIT
└── README.md         # Este archivo
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](./LICENSE) para más detalles.

---

## 👥 Contribución

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 🆘 Troubleshooting

### Backend no inicia
- Verifica que PostgreSQL esté corriendo: `systemctl status postgresql`
- Verifica credenciales en `.env`
- Verifica puerto 8000 disponible: `lsof -i :8000`

### Frontend no conecta con Backend
- Verifica que backend esté corriendo
- Verifica VITE_API_URL en `.env`
- Revisa consola del navegador (F12)

### Mobile no conecta
- Verifica que PC y móvil estén en misma WiFi
- Usa tu IP local, no `localhost`
- Verifica `app.config.js` tiene IP correcta
- Revisa firewall no bloquee puerto 8000

### Puerto ocupado
```bash
# Encontrar proceso usando puerto
lsof -i :8000  # o :3000, :8081

# Matar proceso
kill -9 <PID>
```

---

## 📞 Soporte

Para problemas o preguntas:
- Abre un [Issue](https://github.com/JuanEstebanMartinezM/Semillero-SENA-TECH/issues)
- Revisa la documentación completa en cada carpeta
- Consulta la documentación oficial de las tecnologías

---

