#!/usr/bin/env bash
set -e

# RunRanger Local Development Script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🌲 Starting RunRanger in Development Mode..."
echo "📍 Root directory: $ROOT_DIR"

# Check Python virtual environment
cd "$ROOT_DIR/backend"
if [ ! -d ".venv" ]; then
  echo "📦 Creating backend virtual environment..."
  python3 -m venv .venv
  source .venv/bin/activate
  pip install --upgrade pip
  pip install fastapi uvicorn httpx pydantic pytest anyio
else
  source .venv/bin/activate
fi

# Check frontend node_modules
cd "$ROOT_DIR/frontend"
if [ ! -d "node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  npm install
fi

echo "🚀 Starting FastAPI on http://localhost:8000 and Vite on http://localhost:5173..."
echo "💡 Tip: Start Ollama in another terminal with 'ollama serve' to activate local Gemma 3 AI."

# Run both backend and frontend concurrently
cd "$ROOT_DIR/backend"
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

cd "$ROOT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

# Trap SIGINT and SIGTERM to kill background processes cleanly
cleanup() {
  echo ""
  echo "🛑 Stopping RunRanger development servers..."
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

wait
