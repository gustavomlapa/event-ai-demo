#!/usr/bin/env bash
# ==============================================================================
# Tech Battle Royale — Self-Healing GCP Cloud Run & Firestore Deployment Script
# ==============================================================================
set -euo pipefail

# Cores para terminal
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}=====================================================${NC}"
echo -e "${CYAN}   🚀 Tech Battle Royale — Deploy Automatizado GCP   ${NC}"
echo -e "${CYAN}=====================================================${NC}"

# 1. Carrega variáveis do .env se existir
if [ -f .env ]; then
  echo -e "${YELLOW}ℹ️  Carregando configurações locais de .env...${NC}"
  set -a
  source .env
  set +a
fi

# 2. Resolução do Projeto GCP
PROJECT_ID="${GCP_PROJECT_ID:-}"
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "your-gcp-project-id" ]; then
  PROJECT_ID=$(gcloud config get-value project 2>/dev/null || true)
fi

if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}❌ Erro: GCP_PROJECT_ID não definido no .env e nenhum projeto ativo no gcloud.${NC}"
  echo -e "   Execute: gcloud config set project SEU_PROJETO_ID"
  exit 1
fi

GCP_REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-tech-battle-royale}"
FIRESTORE_DATABASE_ID="${FIRESTORE_DATABASE_ID:-(default)}"

echo -e "📌 Projeto GCP: ${GREEN}${PROJECT_ID}${NC}"
echo -e "📌 Região:      ${GREEN}${GCP_REGION}${NC}"
echo -e "📌 Serviço:     ${GREEN}${SERVICE_NAME}${NC}"

# 3. Obtenção do Número do Projeto
echo -e "\n${YELLOW}🔍 Consultando número do projeto no GCP...${NC}"
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
echo -e "✅ Número do Projeto: ${GREEN}${PROJECT_NUMBER}${NC}"

# 4. Habilitação das APIs Necessárias
echo -e "\n${YELLOW}🔌 Habilitando APIs necessárias (Run, Build, Artifact Registry, Firestore, Storage)...${NC}"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  --project "$PROJECT_ID"

# 5. Configuração de Permissões IAM (Compute Engine Service Account)
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
echo -e "\n${YELLOW}🔐 Configurando roles na Service Account ${COMPUTE_SA}...${NC}"

ROLES=(
  "roles/storage.admin"
  "roles/logging.logWriter"
  "roles/artifactregistry.writer"
  "roles/datastore.user"
)

for ROLE in "${ROLES[@]}"; do
  echo -e "   Atribuindo ${ROLE}..."
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${COMPUTE_SA}" \
    --role="$ROLE" \
    --condition=None \
    --quiet >/dev/null 2>&1 || true
done
echo -e "✅ Permissões IAM aplicadas com sucesso."

# 6. Provisionamento Automático do Firestore (Native Mode)
echo -e "\n${YELLOW}📦 Verificando banco de dados Firestore (Modo Nativo)...${NC}"
if ! gcloud firestore databases describe --database="$FIRESTORE_DATABASE_ID" --project="$PROJECT_ID" >/dev/null 2>&1; then
  echo -e "   Criando banco Firestore (${FIRESTORE_DATABASE_ID}) na região ${GCP_REGION}..."
  gcloud firestore databases create \
    --database="$FIRESTORE_DATABASE_ID" \
    --location="$GCP_REGION" \
    --type=firestore-native \
    --project="$PROJECT_ID" || true
  echo -e "✅ Firestore Native provisionado!"
else
  echo -e "✅ Banco Firestore já existe e está pronto para uso."
fi

# 7. Build e Deploy no Google Cloud Run
echo -e "\n${YELLOW}🚀 Iniciando Build e Deploy no Google Cloud Run...${NC}"
echo -e "   Configuração: Concorrência 80 | min-instances 1 | Acesso Público"

gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --project "$PROJECT_ID" \
  --region "$GCP_REGION" \
  --platform managed \
  --allow-unauthenticated \
  --concurrency 80 \
  --min-instances 1 \
  --set-env-vars "NODE_ENV=production,USE_LOCAL_MOCK=false,GCP_PROJECT_ID=${PROJECT_ID},FIRESTORE_DATABASE_ID=${FIRESTORE_DATABASE_ID},GCP_REGION=${GCP_REGION}"

# 8. Obtenção da URL Final
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
  --project "$PROJECT_ID" \
  --region "$GCP_REGION" \
  --format="value(status.url)")

echo -e "\n${GREEN}=====================================================${NC}"
echo -e "${GREEN}   🎉 DEPLOY CONCLUÍDO COM SUCESSO!                  ${NC}"
echo -e "${GREEN}=====================================================${NC}"
echo -e "📱 Telão / Projetor do Palco: ${CYAN}${SERVICE_URL}/screen.html${NC}"
echo -e "📱 Celular dos Participantes: ${CYAN}${SERVICE_URL}/${NC}"
echo -e "🎛️  Painel do Apresentador:    ${CYAN}${SERVICE_URL}/admin.html${NC}"
echo -e "${GREEN}=====================================================${NC}\n"
