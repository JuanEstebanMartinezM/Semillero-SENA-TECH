#!/bin/bash

# Script para iniciar el backend de FastAPI
# Configura el entorno y ejecuta uvicorn

# Cambiar al directorio del script
cd "$(dirname "$0")"

# Activar virtual environment
source venv/bin/activate

# Agregar src al PYTHONPATH
export PYTHONPATH="$(pwd)/src:$PYTHONPATH"


# Ejecutar desde el directorio src es más confiable
cd src
uvicorn main:app --reload --host 0.0.0.0 --port 8000
