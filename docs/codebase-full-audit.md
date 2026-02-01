Full Codebase Audit — Wheels & Glass

Scope
- Static code and repository review covering `shared`, `server`, and `client` packages.
- End-to-end flow: public VIN submission -> NAGS lookup orchestrator -> cache -> distributors -> omega fallback -> manual queue -> retry queue.
- CI, migrations, deploy workflows, tests, and scripts added during this engagement.

Executive Summary
- Core outcomes completed:
  - Added `statusHistory` and `retry_queue` DB artifacts (migrations exist and were applied).
  - Implemented a tiered NAGS lookup orchestrator and scaffolding for distributor scrapers.
  - Added a polite, rate-limited `MygrantScraper` stub and a working `OmegaFallbackService` mapper.
  - Built a safe E2E harness and `safe-vin-run.ts` script to exercise a single VIN lookup without calling paid services.
  - Created unit tests (Vitest) for the scraper and an E2E test harness that mocks external services.
  - Added CI job `nags-e2e` that runs tests and the safe VIN script on a Postgres service.
  - Deployed to Vercel and added a GitHub Action to trigger Vercel deployment using secrets.

Key Findings (Issues)
1. Module resolution / runtime aliasing
   - `@shared/schema` is used across the repo. Some runtimes (Vitest / Vite / Node ESM) cannot resolve the alias without building `shared` or adding runtime alias mappings. This caused test failures until a `vitest.config.ts` alias and building `shared` were added.
   - Recommendation: publish or build `shared/dist` during CI and ensure `exports` in `shared/package.json` are correct; maintain a `vitest.config.ts` (already added for server tests).

2. Migrations + schema drift
   - Migration files exist in `drizzle/migrations` and duplicated copies exist under `server/src/db/drizzle/` (this repo contains several migration copies). This is OK if intentional, but it risks drift.
   - Recommendation: centralize migrations (prefer `server/src/db/drizzle` or the `drizzle` top-level folder), and ensure CI runs `db:migrate` (now added) before tests/deploy.

3. .gitignore and migration files
   - One migration directory was previously ignored; migration files were force-added during work. Avoid force-add in future; instead adjust `.gitignore` to allow committed migrations.

4. Scrapers and external integrations
   - Distributor scrapers are placeholders. They must be implemented carefully: encrypted credentials, rate-limiting, randomized delays, and legal compliance.
   - Omega EDI calls cost money — the orchestrator must ensure caching + cost-budgeting to avoid runaway queries.

5. Retry & reliability
   - A persistent `retry_queue` table and worker were added; the worker must be monitored and have backoff, dead-letter, and cost-protection gating.

6. Secrets & credentials
   - `ENCRYPTION_KEY`, distributor credentials, and `DATABASE_URL` must be set in deployment secrets (Vercel/GitHub). Never store plain text credentials in repo.

7. Tests & CI
   - Vitest runs are in place. The `nags-e2e` job initially lacked migrations; CI now runs server migrations before tests/safe-run.

Suggested Actions (Prioritized)
- High (do ASAP):
  1. Add production CI secrets to GitHub: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `DATABASE_URL` (for deploy previews/test DB), `ENCRYPTION_KEY`.
  2. Centralize migrations and ensure `db:migrate` is the single source of truth; remove duplicate migration folders or clearly document why duplicates exist.
  3. Add cost-protection gates in the retry worker and orchestrator to limit Omega calls (e.g., hourly budgets, alerts when N retries exceed threshold).

- Medium:
  1. Implement distributor scrapers behind feature flags; add credential vault access in runtime.
  2. Add monitoring for retry queue growth and dead-letter alerts (PagerDuty/email/SNS).
  3. Add integration tests that exercise the full flow against a test DB (CI already has a safe job but consider test coverage expansion).

- Low:
  1. Add granular metrics for per-tier latency and cost per VIN lookup.
  2. Add an admin UI to view manual queue entries and retry queue state.

Files changed in this engagement
- server/src/services/nags-lookup/* (new orchestration, cache, distributors, omega fallback, manual escalation)
- server/src/db/schema/nags-cache.ts (new Drizzle schema for NAGS)
- server/src/db/drizzle/* (migrations added)
- server/scripts/safe-vin-run.ts (safe VIN-run script)
- server/scripts/apply-retry-table.ts (helper to apply missing retry DDL)
- server/src/services/nags-lookup/__tests__/* (vitest tests)
- server/vitest.config.ts (alias mapping)
- .github/workflows/ci.yml (CI changes: added NAGS E2E job and run migrations)
- .github/workflows/deploy-vercel.yml (Vercel deploy workflow)

How to validate end-to-end safely
1. Use a test DB (not production) for `DATABASE_URL`.
2. Run migrations: `npm --workspace=server run db:migrate`.
3. Build and run tests: `npm --workspace=shared run build && npm --workspace=server run build && npm --workspace=server test`.
4. Run safe VIN script (successful): `SHOULD_SUCCEED=true npx tsx server/scripts/safe-vin-run.ts`.
5. Run safe VIN script (failure): `SHOULD_SUCCEED=false npx tsx server/scripts/safe-vin-run.ts` and verify retry row gets created.

CI Notes
- CI now executes migrations before tests and the safe VIN script.
- The Vercel deploy workflow is present and requires repository secrets to complete autopush deployments.

Final recommendation
- Merge the changes in CI and deploy workflows, provision required secrets in GitHub and Vercel, and schedule a short maintenance window to run a full integrated test against a non-production DB. After that, enable the distributor scrapers behind feature flags and monitor system health.
