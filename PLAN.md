# PLAN: Tech Battle Royale (Live AI Demo on Cloud Run + Firestore)

- [x] 1. In `.gitignore`, create comprehensive ignore rules for `node_modules`, `.env`, build artifacts, and system files.
- [x] 2. In `.env.example`, define the required environment variables (`GCP_PROJECT_ID`, `GCP_REGION`, `SERVICE_NAME`, `PORT`, `FIRESTORE_DATABASE_ID`, `USE_LOCAL_MOCK`).
- [x] 3. In `deploy.sh`, write an automated deployment script for Google Cloud Run that validates `.env`, configures flags (concurrency, unauthenticated access), and deploys the container.
- [x] 4. In `TECH_BATTLE_SPEC_PROMPT.md`, document the complete context (audience narrative, AI productivity value, GCP Cloud Run + Firestore architecture, the 10 questions, the trophy algorithm, and the exact Antigravity prompt for live execution).
- [x] 5. In `package.json`, configure project metadata, runtime dependencies (`express`, `@google-cloud/firestore`, `dotenv`, `cors`), test runner (`jest`, `supertest`), and scripts.
- [ ] 6. In `tests/trophyService.test.js`, write unit tests for the trophy calculation algorithm (The Flash, The Philosopher, The Lone Wolf, Voice of the People, and edge cases like zero votes or ties).
- [ ] 7. In `src/services/trophyService.js`, implement the trophy calculation functions until all tests in `tests/trophyService.test.js` pass.
- [ ] 8. In `tests/gameService.test.js`, write unit tests for game state lifecycle, the 10 predefined questions, duplicate vote prevention, and score aggregation.
- [ ] 9. In `src/services/gameService.js`, implement game state management, round lifecycle, and voting logic with Firestore support until all tests in `tests/gameService.test.js` pass.
- [ ] 10. In `tests/api.test.js`, write failing integration tests for all REST API endpoints (`/api/state`, `/api/join`, `/api/vote`, `/api/results`, `/api/trophies`, `/api/admin/next`, `/api/admin/reset`).
- [ ] 11. In `src/config/env.js`, `src/config/firestore.js`, `src/app.js`, and `src/server.js`, implement the configuration and Express server until all integration tests in `tests/api.test.js` pass.
- [ ] 12. In `src/public/index.html` and `src/public/js/player.js`, build the 1-tap mobile participant interface with nickname registration, touch feedback, and response time measurement.
- [ ] 13. In `src/public/screen.html` and `src/public/js/screen.js`, build the high-resolution stage display with dynamic QR code, animated tug-of-war battle bar, real-time score updates, and the trophy celebration podium.
- [ ] 14. In `src/public/admin.html` and `src/public/js/admin.js`, build the discrete presenter dashboard to advance rounds and reset sessions.
- [ ] 15. In `Dockerfile` and `.dockerignore`, configure the multi-stage build optimized for Google Cloud Run with non-root user execution.
- [ ] 16. Run full verification suite (`npm test`, syntax validation of `deploy.sh`, and local server dry-run).
