#!/usr/bin/env bash
set -e

# RunRanger Test Runner (Backend + Frontend)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🧪 Running RunRanger Test Suite..."

echo ""
echo "=== 1. Backend Tests (pytest) ==="
cd "$ROOT_DIR/backend"
source .venv/bin/activate
python -m pytest -v

echo ""
echo "=== 2. Frontend Tests (vitest) ==="
cd "$ROOT_DIR/frontend"
npm test

echo ""
echo "=== 3. Frontend Production Build Check ==="
npm run build

echo ""
echo "✅ All RunRanger tests and build checks passed cleanly!"
