#!/usr/bin/env bash
# ==============================================================================
# Tech Battle Royale - Cloud Run Deployment Script (Self-Healing IAM & APIs)
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
echo "   - GCP Project:  $GCP_PROJECT_ID"
echo "   - Region:       $GCP_REGION"
echo "   - Service:      $SERVICE_NAME"
echo "   - Firestore DB: ${FIRESTORE_DATABASE_ID:-(default)}"

# 3. Resolve gcloud CLI executable
GCLOUD_CMD="gcloud"
if [ -f "/Users/gustavolapa/Documents/libs/google-cloud-sdk/bin/gcloud" ]; then
  GCLOUD_CMD="/Users/gustavolapa/Documents/libs/google-cloud-sdk/bin/gcloud"
elif ! command -v gcloud &> /dev/null; then
  echo "❌ Erro: 'gcloud' CLI não está instalado ou não está no PATH."
  exit 1
fi

echo "🔧 Verificando projeto ativo ($GCP_PROJECT_ID)..."
"$GCLOUD_CMD" config set project "$GCP_PROJECT_ID" --quiet 2>/dev/null || true

# 4. Resolve Project Number & Service Accounts
echo "🔍 Identificando número do projeto e Service Accounts..."
PROJECT_NUMBER=$("$GCLOUD_CMD" projects describe "$GCP_PROJECT_ID" --format='value(projectNumber)')
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

echo "   - Project Number: $PROJECT_NUMBER"
echo "   - Default Compute SA: $COMPUTE_SA"

# 5. Enable Required APIs (Cloud Run, Cloud Build, Artifact Registry, Firestore, Storage)
echo "🔌 Verificando e habilitando APIs necessárias..."
"$GCLOUD_CMD" services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  --project "$GCP_PROJECT_ID" \
  --quiet

# 6. Configure IAM Roles for Build and Runtime
# In newer GCP projects, Cloud Build uses the Compute Engine default service account to resolve source zips in GCS and write images.
# Also, the Cloud Run container runtime requires Firestore access (roles/datastore.user).
echo "🛡️ Configurando permissões IAM essenciais..."

REQUIRED_ROLES=(
  "roles/storage.admin"
  "roles/logging.logWriter"
  "roles/artifactregistry.writer"
  "roles/datastore.user"
)

for role in "${REQUIRED_ROLES[@]}"; do
  echo "   - Atribuindo $role para $COMPUTE_SA..."
  "$GCLOUD_CMD" projects add-iam-policy-binding "$GCP_PROJECT_ID" \
    --member="serviceAccount:$COMPUTE_SA" \
    --role="$role" \
    --condition=None \
    --quiet > /dev/null || true
done

# Also ensure Cloud Build SA has storage and logging access if it exists
echo "   - Verificando permissões para Cloud Build SA..."
"$GCLOUD_CMD" projects add-iam-policy-binding "$GCP_PROJECT_ID" \
  --member="serviceAccount:$CLOUDBUILD_SA" \
  --role="roles/storage.admin" \
  --condition=None \
  --quiet > /dev/null 2>&1 || true

"$GCLOUD_CMD" projects add-iam-policy-binding "$GCP_PROJECT_ID" \
  --member="serviceAccount:$CLOUDBUILD_SA" \
  --role="roles/logging.logWriter" \
  --condition=None \
  --quiet > /dev/null 2>&1 || true

# 7. Ensure Firestore Native Database exists
echo "🗄️ Verificando banco de dados Firestore..."
DB_NAME="${FIRESTORE_DATABASE_ID:-(default)}"
if ! "$GCLOUD_CMD" firestore databases describe --database="$DB_NAME" --project "$GCP_PROJECT_ID" --quiet >/dev/null 2>&1; then
  echo "   - Banco '$DB_NAME' não encontrado. Criando Firestore em modo Nativo em $GCP_REGION..."
  "$GCLOUD_CMD" firestore databases create \
    --location="$GCP_REGION" \
    --type=firestore-native \
    --database="$DB_NAME" \
    --project "$GCP_PROJECT_ID" \
    --quiet || true
else
  echo "   - Banco Firestore '$DB_NAME' já existe e está pronto."
fi

# 8. Deploy to Cloud Run
echo "📦 Iniciando build e deploy no Cloud Run..."
"$GCLOUD_CMD" run deploy "$SERVICE_NAME" \
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
SERVICE_URL=$("$GCLOUD_CMD" run services describe "$SERVICE_NAME" \
  --project "$GCP_PROJECT_ID" \
  --region "$GCP_REGION" \
  --format='value(status.url)')

echo "🌐 Aplicação no Ar:"
echo "   - Participante (Celular): $SERVICE_URL"
echo "   - Telão (Projetor):       $SERVICE_URL/screen.html"
echo "   - Painel Apresentador:    $SERVICE_URL/admin.html"
echo "=================================================="
