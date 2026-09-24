# ⚔️ Tech Battle Royale — Live AI Event Demo

Aplicação web em tempo real inspirada no estilo Kahoot para eventos com mais de 300 desenvolvedores. Projetada para execução escalável no **Google Cloud Run** integrada ao **Google Cloud Firestore (Native Mode)**, com suporte a desenvolvimento e testes locais offline (mock em memória).

---

## 🎯 Visão Geral & Telas

| Tela | Rota | Descrição |
| :--- | :--- | :--- |
| **📱 Participante (Mobile)** | `/` | Interface *zero friction* (sem login/senha). Entrada de apelido e votação **1-Tap** em 2 botões gigantes coloridos com feedback tátil e medição de latência em milissegundos. |
| **🖥️ Telão Principal (Stage)** | `/screen.html` | Exibição em alta definição para o projetor/telão: **QR Code** de entrada gerado automaticamente, contador de devs online, gráfico dinâmico em **Cabo de Guerra**, timer regressivo sincronizado de 10s e cerimônia final com confetes. |
| **🎛️ Painel do Apresentador** | `/admin.html` | Console para o palestrante controlar a abertura, encerramento e avanço das 10 rodadas técnicas, disparar a revelação dos troféus ou resetar a partida. |

---

## 🏛️ Arquitetura & Boas Práticas

- **Alta Concorrência & Zero Contention:** Para absorver mais de 300 votos simultâneos em 10 segundos, cada voto é gravado como um documento individual em subcoleção Firestore (`/games/{sessionId}/rounds_{id}/{participantId}`), evitando o limite de 1 escrita/segundo por documento.
- **Prevenção do Bug Falsy em JS:** Na ausência de votos, a API e o frontend reportam estritamente `0% (0 votos)` mantendo o cabo de guerra centralizado em 50%/50% em repouso neutro.
- **Auto-Logout Sincronizado:** Ao resetar a partida no `/admin.html`, um novo `sessionId` é emitido. Os smartphones dos participantes detectam a troca via polling e efetuam auto-logout, limpando o armazenamento local.
- **Cloud Run Otimizado:** Container com imagem multi-stage Alpine não-root (`USER node`), concorrência ajustada para 80 requisições simultâneas e `min-instances: 1` para garantir latência imediata sem *cold starts*.

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- Node.js 20+ instalado na máquina.
- npm ou yarn.

### 2. Instalação
```bash
# Clone o repositório e acesse o diretório
cd event-ai-demo

# Instale as dependências
npm install
```

### 3. Configuração do `.env`
O projeto já conta com o arquivo `.env.example`. Crie seu `.env` a partir dele:
```bash
cp .env.example .env
```

Por padrão local, `USE_LOCAL_MOCK=true` vem habilitado, permitindo que a aplicação execute com persistência em memória sem necessitar de emuladores ou credenciais do Google Cloud:
```ini
PORT=8080
NODE_ENV=development
USE_LOCAL_MOCK=true
GCP_PROJECT_ID=your-gcp-project-id
GCP_REGION=us-central1
SERVICE_NAME=tech-battle-royale
FIRESTORE_DATABASE_ID=(default)
```

> [!CAUTION]
> **Segurança:** O arquivo `.env` e quaisquer chaves `*.json` já estão configurados no `.gitignore`. **Nunca commite chaves de API, credenciais ou IDs sensíveis no Git.**

### 4. Executar o Servidor
```bash
# Modo desenvolvimento com hot-reload automático
npm run dev

# Ou modo produção
npm start
```

Acesse no seu navegador:
- Telão: [http://localhost:8080/screen.html](http://localhost:8080/screen.html)
- Participante: [http://localhost:8080/](http://localhost:8080/)
- Admin: [http://localhost:8080/admin.html](http://localhost:8080/admin.html)

---

## 🧪 Como Rodar a Suíte de Testes (TDD)

O projeto possui cobertura completa de testes unitários e de integração utilizando **Jest** e **Supertest**:

```bash
# Executa todos os testes
npm test

# Executa testes unitários específicos
npm test -- tests/unit/gameService.test.js
npm test -- tests/unit/trophyService.test.js

# Executa testes de integração das rotas HTTP
npm test -- tests/integration/api.test.js
```

---

## ☁️ Deploy Automatizado no Google Cloud (Cloud Run + Firestore)

O script `deploy.sh` é **self-healing** e prepara todo o ambiente GCP automaticamente para projetos novos.

### 1. Pré-requisitos do GCP
- Ter a ferramenta `gcloud` instalada e autenticada:
  ```bash
  gcloud auth login
  gcloud config set project SEU_PROJETO_ID
  ```
- Ter permissão de Proprietário/Editor no projeto GCP ou permissões de IAM para habilitar APIs e atribuir roles.

### 2. Executar o Deploy
Basta executar o script autônomo:
```bash
./deploy.sh
```

### O que o script `deploy.sh` faz por você:
1. Detecta o ID e número do projeto GCP ativo.
2. Habilita as APIs: `run.googleapis.com`, `cloudbuild.googleapis.com`, `artifactregistry.googleapis.com`, `firestore.googleapis.com`, `storage.googleapis.com`.
3. Concede as permissões necessárias à Service Account padrão do Compute Engine (`roles/storage.admin`, `roles/logging.logWriter`, `roles/artifactregistry.writer`, `roles/datastore.user`).
4. Provisiona automaticamente a base do **Firestore no Modo Nativo** caso ainda não exista.
5. Constrói o container multi-stage e publica no **Cloud Run** com `concurrency: 80` e `min-instances: 1`.
6. Imprime as URLs públicas prontas para exibição no palco!

---

## 🎤 Guia do Apresentador (Roteiro de Palco de 20 min)

1. **Abertura (0-5 min):**
   - Projete a tela `/screen.html` no projetor principal.
   - O QR Code gigante e o contador de devs conectados serão exibidos.
   - Convide os mais de 300 desenvolvedores a apontarem a câmera e escolherem um apelido.
2. **A Batalha (5-15 min):**
   - Abra o `/admin.html` no seu celular ou tablet.
   - Clique em **"▶️ Abrir Votação (10s)"**.
   - Os celulares dos participantes exibirão imediatamente os dois botões gigantes.
   - Conforme votam, o **Cabo de Guerra** oscilará ao vivo no telão.
   - Após 10 segundos, encerre e avance para as próximas rodadas para gerar debates leves na plateia.
3. **O Oscar dos Devs (15-20 min):**
   - Ao final, clique em **"🏆 Ir para Troféus (Oscar)"**.
   - O telão disparará confetes e revelará os troféus divertidos calculados com dados reais:
     - ⚡ **The Flash (Gatilho Rápido):** Menor tempo médio de resposta geral.
     - 🧘 **O Filósofo da Arquitetura:** Maior tempo médio de resposta (pensou até o fim).
     - 🐺 **O Lobo Solitário:** Mais votos na opção minoritária da sala.
     - 🤝 **A Voz do Povo:** 100% alinhado com a maioria do auditório.
     - 🛠️ **A Stack Oficial do Auditório:** Resumo das tecnologias consagradas pela sala.