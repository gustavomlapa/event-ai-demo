---
name: seguranca-apps-gcp
description: Guia de melhores práticas para prevenção de vazamento de segredos no GitHub e blindagem de segurança em ambientes GCP.
version: 1.0.0
tags: [security, gcp, github, iam, secret-manager, workload-identity, devsecops]
---

# 🛡️ Melhores Práticas: Segurança de Aplicações e Ambientes GCP

Este documento estabelece o protocolo de segurança para o desenvolvimento de software e infraestrutura em nuvem no **Google Cloud Platform (GCP)**, cobrindo desde a prevenção de vazamentos no repositório até a proteção de runtimes e dados.

---

## 1. Prevenção de Vazamento de Credenciais (GitHub / Dev Local)

O vazamento de chaves de API e credenciais de nuvem em repositórios é um dos maiores vetores de invasão e faturas astronômicas inesperadas. Adote o modelo de **Defesa em Camadas**.

### 1.1 Regra de Ouro: NUNCA gere chaves JSON de Service Account
- O recurso de gerar arquivos de chave JSON privada (`service-account-key.json`) é um mecanismo legado de alto risco.
- **Alternativas modernas:**
  - Em ambientes GCP (Cloud Run, GKE, Compute Engine): use a identidade nativa da instância vinculada via IAM.
  - No CI/CD externo (GitHub Actions): use **Workload Identity Federation** (troca de tokens OIDC sem chaves estáticas).
  - Em desenvolvimento local: use `gcloud auth application-default login` ou emuladores locais (ex: Firebase Local Emulator).

### 1.2 Camada 1: `.gitignore` Blindado
Garanta que seu `.gitignore` contenha explicitamente padrões para segredos e arquivos sensíveis:
```gitignore
# Arquivos de ambiente e segredos
.env
.env.*
!.env.example
*.key
*.pem
*.p12
*.crt
*credential*.json
*service-account*.json
*token*.json

# Diretórios locais de ferramentas de nuvem
.gcloud/
.firebase/
```

### 1.3 Camada 2: Bloqueio no Pré-Commit com Gitleaks
Instale ferramentas de escaneamento estático que rodam antes do `git commit` acontecer localmente:

1. Instale o [Gitleaks](https://github.com/gitleaks/gitleaks):
   ```bash
   brew install gitleaks
   ```
2. Adicione ao gancho de pre-commit do repositório (`.git/hooks/pre-commit` ou via `husky`):
   ```bash
   #!/bin/sh
   gitleaks protect --staged --verbose
   ```
   Se qualquer hash de chave privada, token do GitHub ou padrão de API Key for detectado, o commit é cancelado na hora.

### 1.4 Camada 3: Proteção Ativa no GitHub (Push Protection)
Nas configurações do repositório no GitHub (`Settings > Code security and analysis`):
- Ative **Secret scanning**.
- Ative **Push protection** (o GitHub rejeitará qualquer `git push` que contenha credenciais conhecidas).

### 1.5 Plano de Ação em Caso de Vazamento Acidental
Se uma chave for comitada e enviada para o repositório remoto:
1. **Revogue a credencial IMEDIATAMENTE** no console do provedor (não adianta apenas apagar o commit se a chave ainda for válida).
2. Não tente "apagar o arquivo com um novo commit" — ele permanece no histórico git.
3. Se o repositório for público, considere a chave comprometida desde o segundo 0 (robôs varrem o GitHub em milissegundos).
4. Limpe o histórico do repositório usando `git-filter-repo` ou BFG Repo-Cleaner antes de reabrir o repositório.

---

## 2. Gerenciamento Seguro de Segredos no GCP (Secret Manager)

Nunca passe senhas de banco, chaves de terceiros (Stripe, OpenAI) ou certificados via variáveis de ambiente em texto puro no comando de deploy ou no Dockerfile.

### 2.1 Armazenando Segredos no Secret Manager
```bash
# Cria o segredo
gcloud secrets create API_KEY_EXTERNA --replication-policy="automatic"

# Adiciona o valor de forma segura (sem salvar no histórico do shell)
echo -n "meu_token_super_secreto" | gcloud secrets versions add API_KEY_EXTERNA --data-file=-
```

### 2.2 Injetando Segredos Diretamente no Cloud Run
O Cloud Run monta o segredo diretamente no processo ou como volume montado, sem expô-lo em scripts de deploy:

```bash
# Concede permissão de leitura para a Service Account da aplicação
gcloud secrets add-iam-policy-binding API_KEY_EXTERNA \
  --member="serviceAccount:sa-minha-app@meu-projeto.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Injeta o segredo como variável de ambiente no Cloud Run
gcloud run deploy minha-api \
  --image=... \
  --set-secrets="API_KEY_EXTERNA=API_KEY_EXTERNA:latest"
```

---

## 3. Segurança no Ambiente GCP (Cloud Run & Firestore)

### 3.1 Princípio do Menor Privilégio (Least Privilege IAM)
- **Problema Crítico:** Por padrão, o Cloud Run pode executar com a `Default Compute Service Account` (`PROJECT_NUMBER-compute@developer.gserviceaccount.com`), que costuma ter o papel `Editor` no projeto.
- **Boa Prática Obrigatória:** Crie uma Service Account dedicada para cada serviço/aplicação:
```bash
# Criar conta dedicada
gcloud iam service-accounts create sa-app-producao \
  --description="Service Account para o container de producao da API" \
  --display-name="SA App Prod"

# Conceder APENAS o que ela realmente precisa (ex: Datastore/Firestore User)
gcloud projects add-iam-policy-binding MEU_PROJETO \
  --member="serviceAccount:sa-app-producao@MEU_PROJETO.iam.gserviceaccount.com" \
  --role="roles/datastore.user"
```

### 3.2 Firestore Security Rules (Regras de Segurança de Dados)
Se sua aplicação permite conexões diretas do navegador ou app mobile ao Firestore via Firebase SDK, configure regras rigorosas em `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Regra padrão: BLOQUEIO TOTAL
    match /{document=**} {
      allow read, write: if false;
    }

    // Regra granular para coleção de usuários autenticados
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId
                    && request.resource.data.keys().hasAll(['nickname', 'updatedAt'])
                    && request.resource.data.nickname is string
                    && request.resource.data.nickname.size() <= 30;
    }
  }
}
```

### 3.3 Blindagem de Rede: Ingress Control e Cloud Armor
- **Restrição de Ingress:** Se a aplicação deve passar obrigatoriamente por um API Gateway ou Cloud Load Balancer (com WAF):
  ```bash
  gcloud run services update minha-api \
    --ingress=internal-and-cloud-load-balancing
  ```
- **Cloud Armor:** Configure políticas de WAF no Load Balancer para mitigar SQL Injection, XSS, aplicar geofencing (bloqueio por país) e rate limiting por IP na borda do Google (Edge Network).

---

## 4. Auditoria e Conformidade

1. **Cloud Audit Logs:** Mantenha os logs de atividade de administração (`Admin Activity`) sempre ligados (padrão) e habilite logs de acesso a dados (`Data Access Logs`) para tabelas e buckets que guardam dados sensíveis (LGPD / GDPR).
2. **Alertas de Monitoramento:** Crie políticas no Cloud Monitoring para disparar e-mails/Slack quando houver:
   - Mudanças em políticas de IAM no nível do projeto.
   - Picos de respostas HTTP `403 Forbidden` ou `401 Unauthorized` na sua API.
   - Chamadas excessivas de leitura no Firestore fora do padrão.

---

## 5. Checklist de Verificação de Segurança

- [ ] Nenhum arquivo `.env` ou `service-account*.json` rastreado pelo Git.
- [ ] Gitleaks configurado localmente ou no pipeline de CI.
- [ ] Push Protection ativado no repositório GitHub.
- [ ] Zero uso de chaves JSON estáticas de Service Account para CI/CD (uso de Workload Identity Federation).
- [ ] Cloud Run rodando sob Service Account customizada com privilégio mínimo (`roles/datastore.user`, sem papéis `Owner` ou `Editor`).
- [ ] Segredos de produção lidos exclusivamente via Google Secret Manager.
- [ ] Firestore com regras de segurança ativas impedindo acesso não autorizado.
