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

### Nova Demanda: Design System & UI Moderna Estilo Google Developer
- [x] In `TECH_BATTLE_SPEC_PROMPT.md`, add a dedicated section and master prompt instructions for Google Developer aesthetic (Google 4-color palette `#4285F4`, `#EA4335`, `#FBBC04`, `#34A853`, Material You Dark theme, typography, micro-interactions, high-contrast battle cards).
- [x] In `public/css/style.css`, implement modern Google Developer design tokens, Google 4-color accents, Material You cards, glowing tug-of-war dividing line, and ripple/touch states.
- [x] In `public/index.html`, `public/screen.html`, and `public/admin.html`, link Google Fonts (`Google Sans` / `Outfit` / `Roboto Mono`) and enhance header badges, icons, and Google-style pill chips.
- [x] Run full test suite (`npm test`), verify rendering, and commit atomically with conventional prefixes.

---

## Autocrítica do Plano (Critique)

1. **Performance e Peso de Fontes:**
   - Para não depender exclusivamente de fontes externas no caso de internet lenta no auditório, usaremos fallback robusto: `'Google Sans', 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.
2. **Contraste e Legibilidade no Projetor:**
   - Telões de evento frequentemente perdem contraste sob luz forte. O estilo Google utilizará preto profundo (`#0b0e14` / `#131314`) com superfícies de alto contraste (`#1e2330`), fontes em peso 700/800 e cores vivas do Google (Azul Google `#4285f4` e Vermelho Google `#ea4335`) com sombras de realce (neon glow).
