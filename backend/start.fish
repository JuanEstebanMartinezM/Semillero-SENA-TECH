#!/usr/bin/env fish

# Script para iniciar el backend de FastAPI
# Configura el entorno y ejecuta uvicorn

# Cambiar al directorio del script
cd (dirname (status -f))

# Activar virtual environment
source venv/bin/activate.fish

# Agregar src al PYTHONPATH
set -x PYTHONPATH (pwd)/src $PYTHONPATH


# Ejecutar desde el directorio src es más confiable
cd src
uvicorn main:app --reload --host 0.0.0.0 --port 8000
