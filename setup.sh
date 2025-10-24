#!/bin/bash

# ============================================
# 🏦 Davivienda Task Manager - Setup Script
# ============================================
# Script de instalación y arranque automático
# ============================================

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Banner
echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🏦 Davivienda Task Manager Setup     ║${NC}"
echo -e "${BLUE}║  Instalación Automática               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# 1. VERIFICAR REQUISITOS
# ============================================

print_info "Verificando requisitos previos..."

# Verificar Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 no está instalado. Por favor instálalo primero."
    exit 1
fi
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
print_success "Python $PYTHON_VERSION instalado"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instálalo primero."
    exit 1
fi
NODE_VERSION=$(node --version)
print_success "Node.js $NODE_VERSION instalado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado. Por favor instálalo primero."
    exit 1
fi
NPM_VERSION=$(npm --version)
print_success "npm $NPM_VERSION instalado"

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL no está instalado o no está en PATH"
    print_info "Instálalo con: sudo apt install postgresql postgresql-contrib (Debian/Ubuntu)"
    print_info "O: brew install postgresql (Mac)"
    read -p "¿Continuar de todos modos? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    PG_VERSION=$(psql --version | cut -d' ' -f3)
    print_success "PostgreSQL $PG_VERSION instalado"
fi

# Verificar Git
if ! command -v git &> /dev/null; then
    print_error "Git no está instalado. Por favor instálalo primero."
    exit 1
fi
GIT_VERSION=$(git --version | cut -d' ' -f3)
print_success "Git $GIT_VERSION instalado"

echo ""

# ============================================
# 2. OBTENER IP LOCAL
# ============================================

print_info "Obteniendo IP local..."

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    LOCAL_IP=$(hostname -I | awk '{print $1}')
elif [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)
else
    print_warning "Sistema operativo no reconocido, usando localhost"
    LOCAL_IP="localhost"
fi

print_success "IP Local detectada: $LOCAL_IP"
echo ""

# ============================================
# 3. CONFIGURAR BACKEND
# ============================================

print_info "Configurando Backend (FastAPI)..."

cd backend

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    print_info "Creando entorno virtual de Python..."
    python3 -m venv venv
    print_success "Entorno virtual creado"
fi

# Activar entorno virtual
print_info "Activando entorno virtual..."
source venv/bin/activate

# Instalar dependencias
print_info "Instalando dependencias de Python..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt > /dev/null 2>&1
print_success "Dependencias de backend instaladas"

# Configurar variables de entorno
if [ ! -f ".env" ]; then
    print_info "Creando archivo .env..."
    cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/davivienda_tasks
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://${LOCAL_IP}:3000","exp://192.168.1.0:8081"]
EOF
    print_success "Archivo .env creado"
else
    print_success "Archivo .env ya existe"
fi

# Crear base de datos
print_info "Configurando base de datos PostgreSQL..."
read -p "¿Deseas crear la base de datos davivienda_tasks? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Usuario de PostgreSQL (default: postgres): " PG_USER
    PG_USER=${PG_USER:-postgres}
    
    # Verificar si la base de datos existe
    if psql -U "$PG_USER" -lqt | cut -d \| -f 1 | grep -qw davivienda_tasks; then
        print_warning "Base de datos 'davivienda_tasks' ya existe"
    else
        createdb -U "$PG_USER" davivienda_tasks && print_success "Base de datos creada" || print_warning "No se pudo crear la base de datos automáticamente. Créala manualmente."
    fi
fi

cd ..
print_success "Backend configurado correctamente"
echo ""

# ============================================
# 4. CONFIGURAR FRONTEND WEB
# ============================================

print_info "Configurando Frontend Web (React)..."

cd frontend

# Instalar dependencias
print_info "Instalando dependencias de npm (esto puede tardar)..."
npm install > /dev/null 2>&1
print_success "Dependencias de frontend instaladas"

# Configurar variables de entorno
if [ ! -f ".env" ]; then
    print_info "Creando archivo .env..."
    cat > .env << EOF
VITE_API_URL=http://${LOCAL_IP}:8000
EOF
    print_success "Archivo .env creado"
else
    print_success "Archivo .env ya existe"
fi

cd ..
print_success "Frontend Web configurado correctamente"
echo ""

# ============================================
# 5. CONFIGURAR MOBILE
# ============================================

print_info "Configurando Mobile (React Native + Expo)..."

cd mobile

# Instalar dependencias
print_info "Instalando dependencias de npm (esto puede tardar)..."
npm install > /dev/null 2>&1
print_success "Dependencias de mobile instaladas"

# Configurar API URL en app.config.js
print_info "Configurando IP en app.config.js..."
if grep -q "apiUrl:" app.config.js; then
    # Actualizar IP existente
    sed -i.bak "s|apiUrl: \"http://.*:8000\"|apiUrl: \"http://${LOCAL_IP}:8000\"|g" app.config.js
    print_success "IP configurada en app.config.js"
else
    print_warning "No se pudo configurar automáticamente. Edita app.config.js manualmente."
fi

cd ..
print_success "Mobile configurado correctamente"
echo ""

# ============================================
# 6. RESUMEN DE CONFIGURACIÓN
# ============================================

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Instalación Completada            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
print_info "Resumen de configuración:"
echo ""
echo "  🔧 Backend API:       http://localhost:8000"
echo "  🌐 Frontend Web:      http://localhost:3000"
echo "  📱 Mobile Expo:       Escanea QR con Expo Go"
echo "  🌍 IP Local:          $LOCAL_IP"
echo ""
print_info "API URL para mobile: http://${LOCAL_IP}:8000"
echo ""

# ============================================
# 7. ARRANCAR SERVIDORES
# ============================================

print_warning "NOTA: Se abrirán 3 terminales para ejecutar los servidores"
print_warning "Presiona Ctrl+C en cada terminal para detener los servicios"
echo ""

read -p "¿Deseas iniciar los servidores ahora? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Iniciando servidores..."
    
    # Detectar terminal emulator
    if command -v gnome-terminal &> /dev/null; then
        TERM_CMD="gnome-terminal --"
    elif command -v konsole &> /dev/null; then
        TERM_CMD="konsole -e"
    elif command -v xterm &> /dev/null; then
        TERM_CMD="xterm -e"
    else
        print_error "No se detectó un emulador de terminal compatible"
        print_info "Ejecuta manualmente en 3 terminales:"
        echo ""
        echo "Terminal 1 (Backend):"
        echo "  cd backend && source venv/bin/activate && uvicorn src.main:app --reload --host 0.0.0.0 --port 8000"
        echo ""
        echo "Terminal 2 (Frontend):"
        echo "  cd frontend && npm run dev"
        echo ""
        echo "Terminal 3 (Mobile):"
        echo "  cd mobile && npx expo start"
        exit 0
    fi
    
    # Iniciar Backend
    print_info "Iniciando Backend en nueva terminal..."
    $TERM_CMD bash -c "cd backend && source venv/bin/activate && echo '🚀 Iniciando Backend API...' && uvicorn src.main:app --reload --host 0.0.0.0 --port 8000; exec bash" &
    sleep 2
    
    # Iniciar Frontend
    print_info "Iniciando Frontend en nueva terminal..."
    $TERM_CMD bash -c "cd frontend && echo '🌐 Iniciando Frontend Web...' && npm run dev; exec bash" &
    sleep 2
    
    # Iniciar Mobile
    print_info "Iniciando Mobile en nueva terminal..."
    $TERM_CMD bash -c "cd mobile && echo '📱 Iniciando Expo Mobile...' && npx expo start; exec bash" &
    sleep 2
    
    print_success "Servidores iniciados en nuevas terminales"
    echo ""
    print_info "Espera unos segundos a que los servicios arranquen completamente"
    print_info "Luego abre tu navegador en http://localhost:3000"
    print_info "Y escanea el QR de Expo con tu teléfono"
    echo ""
else
    print_info "Puedes iniciar los servidores manualmente:"
    echo ""
    echo "Terminal 1 (Backend):"
    echo "  cd backend && source venv/bin/activate && uvicorn src.main:app --reload --host 0.0.0.0 --port 8000"
    echo ""
    echo "Terminal 2 (Frontend):"
    echo "  cd frontend && npm run dev"
    echo ""
    echo "Terminal 3 (Mobile):"
    echo "  cd mobile && npx expo start"
    echo ""
fi

print_success "Setup completado exitosamente!"
echo ""
