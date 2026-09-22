#!/usr/bin/env bash
# ==============================================================================
# Tech Battle Royale - Cloud Run Deployment Script
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=================================================="
echo "🚀 Tech Battle Royale - Deploy to Google Cloud Run"
echo "=================================================="

# 1. Load .env file
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "⚠️  Arquivo .env não encontrado. Copiando de .env.example..."
    cp .env.example .env
    echo "❗ Por favor, edite o arquivo .env com seu GCP_PROJECT_ID e execute novamente."
    exit 1
  else
    echo "❌ Erro: Arquivo .env não encontrado."
    exit 1
  fi
fi

# Export variables from .env
set -a
# shellcheck disable=SC1091
source .env
set +a

# 2. Validate required variables
MISSING_VARS=()
[ -z "${GCP_PROJECT_ID:-}" ] && MISSING_VARS+=("GCP_PROJECT_ID")
[ -z "${GCP_REGION:-}" ] && MISSING_VARS+=("GCP_REGION")
[ -z "${SERVICE_NAME:-}" ] && MISSING_VARS+=("SERVICE_NAME")

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo "❌ Erro: As seguintes variáveis obrigatórias estão vazias no .env:"
  for var in "${MISSING_VARS[@]}"; do
    echo "   - $var"
  done
  exit 1
fi

echo "📋 Configurações carregadas do .env:"
echo "   - GCP Project: $GCP_PROJECT_ID"
echo "   - Region:      $GCP_REGION"
echo "   - Service:     $SERVICE_NAME"
echo "   - Firestore DB: ${FIRESTORE_DATABASE_ID:-(default)}"

# 3. Check gcloud CLI
if ! command -v gcloud &> /dev/null; then
  echo "❌ Erro: 'gcloud' CLI não está instalado ou não está no PATH."
  exit 1
fi

# Set active project
echo "🔧 Configurando projeto ativo no gcloud..."
gcloud config set project "$GCP_PROJECT_ID" --quiet

# 4. Enable required APIs (idempotent)
echo "🔌 Verificando e habilitando APIs necessárias (Cloud Run & Firestore)..."
gcloud services enable run.googleapis.com firestore.googleapis.com --quiet

# 5. Deploy to Cloud Run
echo "📦 Iniciando build e deploy no Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --project "$GCP_PROJECT_ID" \
  --region "$GCP_REGION" \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 10 \
  --concurrency 80 \
  --cpu 1 \
  --memory 512Mi \
  --timeout 300s \
  --set-env-vars "GCP_PROJECT_ID=$GCP_PROJECT_ID,FIRESTORE_DATABASE_ID=${FIRESTORE_DATABASE_ID:-(default)},FIRESTORE_COLLECTION_PREFIX=${FIRESTORE_COLLECTION_PREFIX:-tbr_},ADMIN_SECRET=${ADMIN_SECRET:-tech-clash-live-2026}" \
  --quiet

echo ""
echo "=================================================="
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "=================================================="

# Get service URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
  --project "$GCP_PROJECT_ID" \
  --region "$GCP_REGION" \
  --format='value(status.url)')

echo "🌐 Aplicação no Ar:"
echo "   - Participante (Celular): $SERVICE_URL"
echo "   - Telão (Projetor):       $SERVICE_URL/screen.html"
echo "   - Painel Apresentador:    $SERVICE_URL/admin.html"
echo "=================================================="
