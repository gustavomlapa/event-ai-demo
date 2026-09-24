---
name: pipeline-deploy-gcloud
description: Melhores práticas para construção de pipelines de CI/CD automatizados no GCP com gcloud, Cloud Build e GitHub Actions.
version: 1.0.0
tags: [cicd, gcloud, cloud-build, github-actions, cloud-run, devops, automation]
---

# ⚙️ Melhores Práticas: Pipelines Automatizados de Deploy com `gcloud`

Este guia fornece os padrões da indústria para estruturar pipelines de Entrega Contínua (CI/CD) modernos, seguros e automatizados usando o ecossistema Google Cloud (`gcloud`, Cloud Build e integração com GitHub Actions).

---

## 1. Arquitetura do Pipeline de Deploy Contínuo

Um pipeline de deploy resiliente deve seguir um fluxo estrito e sequencial de validações:

```
[Push / Pull Request]
       │
       ▼
1. Lint, Análise Estática & Testes Automatizados (TDD)
       │ (Se falhar, aborta)
       ▼
2. Build e Otimização do Contêiner Docker (Multi-stage)
       │ (Push para Artifact Registry com tag do commit SHA)
       ▼
3. Deploy Canário no Cloud Run (--no-traffic com Tag de Revisão)
       │
       ▼
4. Smoke Test & Health Check na URL da Revisão Candidata
       │
       ├── Se falhar: Aborta e alerta (0% de tráfego afetado)
       └── Se passar:
              ▼
5. Roteamento Progressivo de Tráfego (Canary: 10% -> 100%)
```

---

## 2. Autenticação Passwordless: Workload Identity Federation

Esqueça arquivos de chaves JSON no GitHub Secrets. Use **Workload Identity Federation** para permitir que o GitHub Actions assuma uma Service Account temporária via OIDC.

### 2.1 Configuração Inicial no GCP via `gcloud`
```bash
# 1. Habilitar APIs necessárias
gcloud services enable iamcredentials.googleapis.com sts.googleapis.com

# 2. Criar o Workload Identity Pool
gcloud iam workload-identity-pools create "github-pool" \
  --project="MEU_PROJETO_ID" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# 3. Criar o Provider OIDC
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="MEU_PROJETO_ID" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# 4. Vincular a Service Account ao repositório GitHub específico
gcloud iam service-accounts add-iam-policy-binding "sa-deployer@MEU_PROJETO_ID.iam.gserviceaccount.com" \
  --project="MEU_PROJETO_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/MEU_USUARIO/MEU_REPOSITORIO"
```

---

## 3. Pipeline com GitHub Actions e `gcloud`

Exemplo completo de arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy Automático para Cloud Run

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  id-token: write  # Obrigatório para Workload Identity

env:
  PROJECT_ID: meu-projeto-prod
  REGION: southamerica-east1
  SERVICE_NAME: api-producao
  GAR_REPO: docker-apps

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout do código
        uses: actions/checkout@v4

      - name: Setup Node.js & Dependências
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Rodar Testes TDD
        run: |
          npm ci
          npm test

      - name: Autenticar no Google Cloud via Workload Identity
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: 'projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider'
          service_account: 'sa-deployer@meu-projeto-prod.iam.gserviceaccount.com'

      - name: Configurar gcloud CLI
        uses: google-github-actions/setup-gcloud@v2

      - name: Configurar Docker para Artifact Registry
        run: |
          gcloud auth configure-docker ${{ env.REGION }}-docker.pkg.dev --quiet

      - name: Build e Push da Imagem com Cache
        env:
          IMAGE_TAG: ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.GAR_REPO }}/${{ env.SERVICE_NAME }}:${{ github.sha }}
        run: |
          docker build \
            --cache-from ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.GAR_REPO }}/${{ env.SERVICE_NAME }}:latest \
            -t $IMAGE_TAG \
            -t ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.GAR_REPO }}/${{ env.SERVICE_NAME }}:latest .
          docker push --all-tags ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.GAR_REPO }}/${{ env.SERVICE_NAME }}

      - name: Deploy Canary no Cloud Run (Sem Tráfego Imediato)
        id: deploy-canary
        run: |
          IMAGE_TAG="${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.GAR_REPO }}/${{ env.SERVICE_NAME }}:${{ github.sha }}"
          REVISION_TAG="rev-${{ github.sha }}"

          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image=$IMAGE_TAG \
            --region=${{ env.REGION }} \
            --no-traffic \
            --tag=$REVISION_TAG \
            --format="value(status.url)" > candidate_url.txt

      - name: Smoke Test na Revisão Candidata
        run: |
          URL=$(cat candidate_url.txt)
          echo "Testando URL candidata: $URL/api/health"
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/api/health")
          if [ "$STATUS" -ne 200 ]; then
            echo "Smoke test falhou com status $STATUS! Abortando deploy."
            exit 1
          fi

      - name: Promover 100% do Tráfego para a Nova Revisão
        run: |
          gcloud run services update-traffic ${{ env.SERVICE_NAME }} \
            --region=${{ env.REGION }} \
            --to-tags="rev-${{ github.sha }}=100"
```

---

## 4. Pipeline Nativo com Google Cloud Build (`cloudbuild.yaml`)

Se preferir manter toda a esteira dentro da infraestrutura do GCP (sem agentes externos):

```yaml
steps:
  # 1. Testes de unidade e integração
  - name: 'node:20'
    entrypoint: 'npm'
    args: ['ci']
  - name: 'node:20'
    entrypoint: 'npm'
    args: ['test']

  # 2. Build da Imagem com Kaniko (Cache de camadas de alta velocidade)
  - name: 'gcr.io/kaniko-project/executor:latest'
    args:
      - '--destination=southamerica-east1-docker.pkg.dev/$PROJECT_ID/docker-apps/api:$SHORT_SHA'
      - '--destination=southamerica-east1-docker.pkg.dev/$PROJECT_ID/docker-apps/api:latest'
      - '--cache=true'
      - '--cache-ttl=24h'

  # 3. Deploy no Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'api-producao'
      - '--image=southamerica-east1-docker.pkg.dev/$PROJECT_ID/docker-apps/api:$SHORT_SHA'
      - '--region=southamerica-east1'
      - '--platform=managed'
      - '--quiet'

images:
  - 'southamerica-east1-docker.pkg.dev/$PROJECT_ID/docker-apps/api:$SHORT_SHA'
  - 'southamerica-east1-docker.pkg.dev/$PROJECT_ID/docker-apps/api:latest'
```

---

## 5. Estratégia de Rollback Instantâneo

Se uma regressão for identificada em produção após o deploy:

1. **Liste as revisões estáveis anteriores:**
   ```bash
   gcloud run revisions list --service=api-producao --region=southamerica-east1
   ```
2. **Reverta 100% do tráfego para a revisão estável em menos de 2 segundos:**
   ```bash
   gcloud run services update-traffic api-producao \
     --region=southamerica-east1 \
     --to-revisions=api-producao-00042-xyz=100
   ```
   *Nota:* O Cloud Run não precisa refazer o build nem puxar containers novamente; o roteamento de tráfego é instantâneo no nível do proxy Envoy gerenciado pelo Google.

---

## 6. Checklist de Pipeline de Deploy

- [ ] Pipeline roda suite de testes automatizados antes de gerar a imagem de produção.
- [ ] Autenticação configurada via Workload Identity Federation (nenhuma chave de SA persistida no GitHub).
- [ ] Imagens de contêiner marcadas com o commit SHA imutável (evite depender apenas de `:latest`).
- [ ] Deploy realizado com `--no-traffic` e teste de fumaça (smoke test) prévio.
- [ ] Procedimento de rollback rápido documentado e testado pela equipe.
- [ ] Notificação de status de build/deploy integrada ao canal da equipe (Slack, Discord ou Chat).
