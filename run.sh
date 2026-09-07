#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:-docker}"   # Usage: ./run.sh [docker|local]

info() { echo -e "\033[1;34m[INFO]\033[0m  $*"; }
ok()   { echo -e "\033[1;32m[OK]\033[0m    $*"; }
die()  { echo -e "\033[1;31m[ERROR]\033[0m $*"; exit 1; }

# ── Docker mode (default) ──────────────────────────────────────────────────
run_docker() {
  command -v docker &>/dev/null         || die "Docker not found."
  command -v docker compose &>/dev/null || die "docker compose not found."

  cd "$ROOT"

  [ -f .env ] || die ".env not found. Copy the template:\n  cp .env.example .env"

  info "Building and starting all services..."
  docker compose up --build -d

  info "Waiting for AI service to be healthy..."
  for i in $(seq 1 40); do
    curl -sf http://localhost:8001/health &>/dev/null && break
    sleep 3
  done

  ok "All services running:"
  echo "  Frontend  → http://localhost:80"
  echo "  Backend   → http://localhost:5000"
  echo "  AI        → http://localhost:8001"
  echo "  SHAP API  → http://localhost:8001/shap"
  echo ""
  echo "  Logs:  docker compose logs -f"
  echo "  Stop:  docker compose down"
}

# ── Local mode (no Docker) ─────────────────────────────────────────────────
run_local() {
  command -v python3 &>/dev/null || die "python3 not found."
  command -v node    &>/dev/null || die "node not found."
  command -v npm     &>/dev/null || die "npm not found."

  [ -f "$ROOT/.env" ] && export $(grep -v '^#' "$ROOT/.env" | xargs)

  # ── AI ────────────────────────────────────────────────────────────────
  info "Setting up Python venv..."
  cd "$ROOT/ai"
  [ -d venv ] || python3 -m venv venv
  source venv/bin/activate
  pip install -q -r requirements.txt

  info "Training model (skipped if already trained)..."
  [ -f model/churn_model.pkl ] || python model/train.py

  info "Starting AI service (port 8000)..."
  uvicorn main:app --host 0.0.0.0 --port 8000 &
  AI_PID=$!

  # ── Backend ───────────────────────────────────────────────────────────
  info "Installing backend dependencies..."
  cd "$ROOT/backend"
  npm install --silent

  info "Starting backend (port 5000)..."
  npm start &
  BACKEND_PID=$!

  # ── Frontend ──────────────────────────────────────────────────────────
  info "Installing frontend dependencies..."
  cd "$ROOT/frontend"
  npm install --silent

  info "Starting frontend dev server (port 5173)..."
  npm run dev &
  FRONTEND_PID=$!

  ok "All services started:"
  echo "  Frontend  → http://localhost:5173"
  echo "  Backend   → http://localhost:5000"
  echo "  AI        → http://localhost:8000"
  echo "  SHAP API  → http://localhost:8000/shap"
  echo ""
  echo "  Press Ctrl+C to stop all services."

  trap "kill $AI_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
  wait
}

case "$MODE" in
  docker) run_docker ;;
  local)  run_local  ;;
  *)      echo "Usage: $0 [docker|local]"; exit 1 ;;
esac
