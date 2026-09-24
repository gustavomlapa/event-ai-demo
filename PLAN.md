# PLAN: Tech Battle Royale (Live AI Demo on Cloud Run + Firestore)

- [x] 1. In `.gitignore`, create comprehensive ignore rules for `node_modules`, `.env`, build artifacts, and system files.
- [x] 2. In `.env.example`, define the required environment variables (`GCP_PROJECT_ID`, `GCP_REGION`, `SERVICE_NAME`, `PORT`, `FIRESTORE_DATABASE_ID`, `USE_LOCAL_MOCK`).
- [x] 3. In `deploy.sh`, write an automated deployment script for Google Cloud Run that validates `.env`, configures flags (concurrency, unauthenticated access), and deploys the container.
- [x] 4. In `TECH_BATTLE_SPEC_PROMPT.md`, document the complete context (audience narrative, AI productivity value, GCP Cloud Run + Firestore architecture, the 10 questions, the trophy algorithm, and the exact Antigravity prompt for live execution).
- [x] 5. In `package.json`, configure project metadata, runtime dependencies (`express`, `@google-cloud/firestore`, `dotenv`, `cors`), test runner (`jest`, `supertest`), and scripts.
- [x] 6. In `tests/trophyService.test.js`, write unit tests for the trophy calculation algorithm (The Flash, The Philosopher, The Lone Wolf, Voice of the People, and edge cases like zero votes or ties).
- [x] 7. In `src/services/trophyService.js`, implement the trophy calculation functions until all tests in `tests/trophyService.test.js` pass.
- [x] 8. In `tests/gameService.test.js`, write unit tests for game state lifecycle, the 10 predefined questions, duplicate vote prevention, and score aggregation.
- [x] 9. In `src/services/gameService.js`, implement game state management, round lifecycle, and voting logic with Firestore support until all tests in `tests/gameService.test.js` pass.
- [x] 10. In `tests/api.test.js`, write failing integration tests for all REST API endpoints (`/api/state`, `/api/join`, `/api/vote`, `/api/results`, `/api/trophies`, `/api/admin/next`, `/api/admin/reset`).
- [x] 11. In `src/config/env.js`, `src/config/firestore.js`, `src/app.js`, and `src/server.js`, implement the configuration and Express server until all integration tests in `tests/api.test.js` pass.
- [x] 12. In `src/public/index.html` and `src/public/js/player.js`, build the 1-tap mobile participant interface with nickname registration, touch feedback, and response time measurement.
- [x] 13. In `src/public/screen.html` and `src/public/js/screen.js`, build the high-resolution stage display with dynamic QR code, animated tug-of-war battle bar, real-time score updates, and the trophy celebration podium.
- [x] 14. In `src/public/admin.html` and `src/public/js/admin.js`, build the discrete presenter dashboard to advance rounds and reset sessions.
- [x] 15. In `Dockerfile` and `.dockerignore`, configure the multi-stage build optimized for Google Cloud Run with non-root user execution.
- [x] 16. Run full verification suite (`npm test`, syntax validation of `deploy.sh`, and local server dry-run).
- [x] 17. In `deploy.sh`, add automated IAM resolution and role bindings (`roles/storage.admin`, `roles/logging.logWriter`, `roles/artifactregistry.writer`, `roles/datastore.user`) for the default compute service account, enable Cloud Build and Artifact Registry APIs, and initialize Firestore native database if not existing.
- [x] 18. In `TECH_BATTLE_SPEC_PROMPT.md`, document the IAM prerequisites and update the master prompt to instruct Antigravity to handle new project IAM setup automatically in `deploy.sh`.
- [x] 19. Validate `deploy.sh` and run deployment verification.
- [x] 20. In `tests/gameService.test.js`, add unit tests for asymmetric voting percentages (0% vs 100%) and 0 total votes.
- [x] 21. In `src/services/gameService.js`, fix percentage calculation when `totalVotes === 0` to return 0% for both options.
- [x] 22. In `src/public/js/screen.js` and `src/public/js/player.js`, replace `data.percentA || 50` falsy bug with proper nullish coalescing (`??`) and update the tug-of-war bar to stay centered (50/50) only when 0 votes exist and accurately reflect real percentages when votes exist.
- [x] 23. In `TECH_BATTLE_SPEC_PROMPT.md`, update prompt instructions to warn against JavaScript `0 || 50` falsy evaluation and specify accurate percentage rendering.
- [x] 24. Re-run tests, deploy update to Cloud Run via `./deploy.sh`, and verify in production.
- [x] 25. In `src/services/gameService.js`, add `sessionId` tracked on instance, regenerated on `resetGame()`, and exposed in `getState()`.
- [x] 26. In `tests/gameService.test.js`, write unit tests verifying `sessionId` generation and regeneration on `resetGame()`.
- [x] 27. In `src/public/index.html` and `src/public/js/player.js`, add logout buttons ("Sair / Trocar Nickname"), hide them during ACTIVE rounds, and implement auto-logout upon `sessionId` mismatch when admin resets the match.
- [x] 28. In `TECH_BATTLE_SPEC_PROMPT.md`, update the specification and Master Prompt with the session management, logout button, and admin reset sync rules.
- [x] 29. Run tests, deploy update to Cloud Run via `deploy.sh`, and verify.

## Skills: Engenharia de Software, Nuvem & Segurança

- [x] 30. In `Skills/gcp-cloud-run-firestore-scaling.md`, create the comprehensive skill document on GCP Cloud Run & Firestore scaling best practices (concurrency, cold starts, memory, execution environment, Firestore contention, distributed counters, caching, indexes).
- [x] 31. In `Skills/seguranca-apps-gcp.md`, create the skill document on application and GCP security best practices (secret leak prevention, pre-commit/gitleaks, Secret Manager, Workload Identity Federation, IAM least privilege, Cloud Armor, Firestore security rules).
- [x] 32. In `Skills/pipeline-deploy-gcloud.md`, create the skill document on automated deployment pipelines using `gcloud` and Cloud Build / GitHub Actions (Workload Identity, multi-stage containers, traffic splitting/canary, rollback automation).
- [x] 33. In `Skills/testes-tdd.md`, create the skill document on Test-Driven Development (Red-Green-Refactor, test pyramid, FIRST principles, mocking vs local emulators, async and edge case coverage).
- [x] 34. In `Skills/git-versionamento.md`, create the skill document on Git versioning and workflow best practices (Conventional Commits, Trunk-Based vs GitHub Flow, atomic commits, branch protection, tags and SemVer, merge vs rebase).
- [x] 35. In `Skills/README.md`, create the index catalog and quick-start guide for all skills.
- [x] 36. Stage and commit the Skills documentation following the git commit conventions.
