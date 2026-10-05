#!/usr/bin/env bash
set -e

# RunRanger Production / Single Process Start Script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🌲 Starting RunRanger (Unified Single Process)..."

# Build frontend if needed
cd "$ROOT_DIR/frontend"
if [ ! -d "dist" ] || [ "$1" == "--rebuild" ]; then
  echo "🔨 Building frontend..."
  npm install
  npm run build
fi

# Run backend serving static frontend
cd "$ROOT_DIR/backend"
source .venv/bin/activate
echo "🚀 RunRanger available at http://localhost:8000"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
