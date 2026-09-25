# Tech Battle Royale — Plano de Execução

## Checklist de Execução

- [x] In `package.json`, configure project metadata, Node.js scripts (`start`, `dev`, `test`), and dependencies (`express`, `@google-cloud/firestore`, `dotenv`, `cors`, `qrcode`, `jest`, `supertest`).
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

### Demandas do Palco (Timer, Persistência e Admin)
- [x] In `TECH_BATTLE_SPEC_PROMPT.md`, update specification with: persistent round result on stage screen until next round is clicked, 30s timer with pause on close and idle on expire, and admin password protection ("techadmin").
- [x] In `src/config.js` and `tests/integration/api.test.js`, add tests and configuration for admin password authentication (`x-admin-password: techadmin`).
- [x] In `src/routes/api.js`, implement admin authentication middleware and `/api/admin/auth` verification endpoint.
- [x] In `public/screen.html` and `public/js/screen.js`, update timer to 30s, implement pause on close, idle on 0s, and ensure round result remains visible on stage during REVEAL until admin advances.
- [x] In `public/admin.html`, `public/js/admin.js`, and `public/css/style.css`, implement admin password login screen ("techadmin"), session storage, and header token transmission.

### Design System Google Developer
- [x] In `TECH_BATTLE_SPEC_PROMPT.md`, add a dedicated section and master prompt instructions for Google Developer aesthetic (Google 4-color palette `#4285F4`, `#EA4335`, `#FBBC04`, `#34A853`, Material You Dark theme, typography, micro-interactions, high-contrast battle cards).
- [x] In `public/css/style.css`, implement modern Google Developer design tokens, Google 4-color accents, Material You cards, glowing tug-of-war dividing line, and ripple/touch states.
- [x] In `public/index.html`, `public/screen.html`, and `public/admin.html`, link Google Fonts (`Google Sans` / `Outfit` / `Roboto Mono`) and enhance header badges, icons, and Google-style pill chips.
- [x] Run full test suite (`npm test`), verify rendering, and commit atomically with conventional prefixes.

### Avanço Automático para Votação Ativa no "Próxima Rodada"
- [x] In `TECH_BATTLE_SPEC_PROMPT.md`, update Section 3 (Painel do Apresentador) and Section 4 (Prompt Mestre) to document that clicking "Próxima Rodada" directly transitions to `ACTIVE`, begins the 30s timer, updates the stage screen, and opens voting immediately, eliminating the redundant step of opening voting manually on every round.
- [x] In `tests/unit/gameService.test.js`, write unit test verifying that `nextRound()` transitions directly to `ACTIVE`, resets `roundStartTime`, and opens voting.
- [x] In `src/services/gameService.js`, update `nextRound()` to set `status = 'ACTIVE'`, initialize `roundStartTime = Date.now()`, and prepare votes map for the new round.
- [x] In `public/admin.html` and `public/js/admin.js`, streamline presenter buttons so that in `LOBBY` the button is "▶️ Iniciar Batalha (Rodada 1)", and in `REVEAL` the button "⏭️ Próxima Rodada" immediately starts the round with 30s countdown and voting open.
- [x] Run full test suite (`npm test`), verify behavior, and commit atomically with conventional prefixes.

### Nova Demanda: Animações Avançadas, Microinterações e Feedback Visual (Confetes, Shake, Telão & Celular)
- [x] In `TECH_BATTLE_SPEC_PROMPT.md`, enrich Section 🎨 Design System & UI Experience and Section 4 (Prompt Mestre) with explicit instructions for micro-interactions, canvas-confetti celebratory particles on majority win, screen shake effect on loss, stage winner cannon animations, ambient mesh background, and visual feedback states.
- [x] In `public/css/style.css`, create keyframe animations for `@keyframes screenShake`, `@keyframes winnerPulse`, `@keyframes laserBeamGlow`, `@keyframes floatCard`, `@keyframes timerUrgentPulse`, and winner/loser feedback card styling.
- [x] In `public/index.html` and `public/js/participant.js`:
  - Import `canvas-confetti` library.
  - Implement dynamic outcome detection on `REVEAL`: if user voted for the winning technology, trigger multi-burst Google-colored confetti, victory card with glowing badge and haptic vibration (`navigator.vibrate([120, 60, 120])`); if voted for the minority technology, trigger subtle screen shake effect (`screenShake`), consoling badge ("Você votou com a minoria audaciosa! 🐺") and light vibration (`navigator.vibrate(200)`).
  - Add ripple effect and scale feedback on 1-tap voting.
- [x] In `public/screen.html` and `public/js/screen.js`:
  - Implement directional confetti blast on stage reveal: shooting from left in Google Blue if Opção A wins, or shooting from right in Google Red if Opção B wins.
  - Add pulsating laser crown and glow around the winning option card, with a subtle shake/dim on the losing side.
  - Add urgent pulsing scale + red neon glow to the 30s timer when remaining seconds <= 5s.
  - Enhance final Oscar ceremony with multi-burst fireworks confetti.
- [x] Run full test suite (`npm test`), verify behavior, and commit atomically with conventional prefixes.

---

## Autocrítica do Plano (Critique)

1. **Impacto de Performance e Mobile Browsers:**
   - *Mitigação:* Usar `canvas-confetti` via CDN (ou biblioteca já instalada/em cache) com número controlado de partículas (`particleCount: 50-80` em mobile, `120-180` no telão) para não travar navegadores mobile mais modestos.
   - O efeito de `screenShake` deve ser rápido (duração de `0.4s` a `0.5s`) com `transform: translate3d(...)` acelerado por hardware (GPU).
2. **Navegadores sem suporte a `navigator.vibrate` (como iOS Safari):**
   - *Mitigação:* Sempre proteger chamadas com `if ('vibrate' in navigator) { navigator.vibrate(...); }`, garantindo que dispositivos sem API de vibração não gerem exceções.
3. **Prevenção de Disparo Múltiplo de Confetes:**
   - *Mitigação:* Controlar o disparo de confetes na revelação com uma flag booleana por rodada (`this.lastRevealedRoundId === state.currentRound.id`), disparando os efeitos visuais exatamente uma vez ao entrar no status `REVEAL`.
