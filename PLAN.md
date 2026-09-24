# Tech Battle Royale — Plano de Execução

## Checklist de Execução

- [x] In `package.json`, configure project metadata, Node.js scripts (`start`, `dev`, `test`), and dependencies (`express`, `@google-cloud/firestore`, `dotenv`, `cors`, `qrcode`, `canvas-confetti`, `jest`, `supertest`).
- [x] In `.gitignore`, create comprehensive ignore rules for `node_modules`, `.env`, build artifacts, GCP credentials, and coverage.
- [x] In `.env.example` and `.env`, configure environment variables (`PORT`, `GCP_PROJECT_ID`, `GCP_REGION`, `SERVICE_NAME`, `FIRESTORE_DATABASE_ID`, `USE_LOCAL_MOCK`, `NODE_ENV`) with safe defaults and placeholders.
- [x] In `src/config.js`, implement configuration loader with validation and default fallbacks.
- [x] In `src/data/rounds.js`, export the 10 official technical rounds specification.
- [x] In `src/services/db.js`, create Firestore client wrapper with automatic fallback to local in-memory storage when `USE_LOCAL_MOCK=true`.
- [x] In `tests/unit/gameService.test.js`, write unit tests for `gameService` covering state transitions, vote calculations, 0 votes edge case, double vote prevention, and session tracking.
- [x] In `src/services/gameService.js`, implement game state machine, round management, vote tallying, and percentage calculation until tests pass.
- [x] In `tests/unit/trophyService.test.js`, write unit tests for the 4 trophies ("The Flash", "O Filósofo da Arquitetura", "O Lobo Solitário", "A Voz do Povo").
- [x] In `src/services/trophyService.js`, implement trophy calculation algorithm until tests pass.
- [x] In `tests/integration/api.test.js`, write integration tests for all REST API endpoints.
- [x] In `src/routes/api.js`, implement REST API routes (`/api/state`, `/api/join`, `/api/vote`, `/api/heartbeat`, `/api/admin/*`, `/api/health`).
- [x] In `src/app.js` and `src/server.js`, configure Express application, middleware, static file serving, and graceful shutdown.
- [x] Run test suite (`npm test`) and ensure 100% passing tests.
- [x] In `public/css/style.css`, create modern dark developer UI stylesheet with glassmorphism, responsive mobile layouts, and tug-of-war animations.
- [x] In `public/index.html` and `public/js/participant.js`, build Mobile Participant interface with 1-tap voting, haptic feedback, response time timer, and auto-logout on session reset.
- [x] In `public/screen.html` and `public/js/screen.js`, build Big Stage Projector view with dynamic QR Code, live devs counter, tug-of-war tug bar with strict nullish checks, 10s countdown, and trophy podium with confetti.
- [x] In `public/admin.html` and `public/js/admin.js`, build Presenter Dashboard with controls for round activation, reveal, next round, trophies, and reset.
- [x] In `Dockerfile`, create an optimized multi-stage build running as non-root user `node`.
- [x] In `deploy.sh`, create self-healing deployment script that auto-detects GCP project, enables APIs, assigns IAM roles to Compute SA, creates Firestore Native if needed, and deploys to Cloud Run with 80 concurrency and min-instances 1.
- [x] In `README.md`, write a complete user and operator manual detailing how to run locally, test with mock, and deploy to GCP Cloud Run.
- [x] Final verification of all flows, tests, and manual steps.

---

## Autocrítica do Plano (Critique)

1. **Risco de Concorrência no Firestore com 300 Votos Simultâneos:**
   - *Gargalo:* O Firestore limita a taxa de gravação em um único documento a ~1 escrita por segundo. Se 300 participantes votarem ao mesmo tempo e tentarmos incrementar o documento da rodada diretamente no banco de dados, o Firestore lançará erros de colisão de transação (`RESOURCE_EXHAUSTED` / `ABORTED`).
   - *Mitigação:* Cada voto será persistido como um documento exclusivo com ID do participante (`votes/{participantId}`). A soma e porcentagens da rodada ativa são mantidas em memória no servidor Cloud Run para resposta imediata ao endpoint `/api/state`, garantindo que os clientes e o telão vejam as atualizações em tempo real sem sobrecarregar o Firestore.

2. **Edge Case de Javascript no Frontend (Bug Falsy):**
   - *Gargalo:* Ao iniciar com 0 votos, `data.percentA || 50` em JavaScript resulta em `50` porque `0` é falsy. Isso geraria 50% vs 100% ou visualização incorreta.
   - *Mitigação:* Usar rigorosamente verificação estrita (`data.percentA !== undefined ? Number(data.percentA) : 0`). O backend explicitamente retorna `{ percentA: 0, percentB: 0, total: 0 }` quando não houver votos, e o CSS posicionará o centro visualmente em 50%/50% em repouso neutro.

3. **Experiência do Participante & Reset de Partida:**
   - *Gargalo:* Participantes que deixam o celular na tela de uma partida anterior podem ter estado dessincronizado ao reiniciar o evento no palco.
   - *Mitigação:* O backend gera um `sessionId` a cada reset. Os clientes mobile comparam periodicamente o `sessionId` via polling e executam auto-logout (limpando o `localStorage` e voltando à tela de apelido) quando detectam nova sessão.
