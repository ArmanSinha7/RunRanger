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

