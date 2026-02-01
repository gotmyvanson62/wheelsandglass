End-to-End VIN Audit — Safe Run

Purpose
- Provide a safe, repeatable way to exercise the customer VIN flow from public surface to internal persistence without hitting paid/production external APIs.

What this does
- Uses a mocked VIN decoder and mocked distributor/Omega lookups to simulate a single external attempt.
- Verifies orchestration calls the expected tier once and either persists cache rows or enqueues a retry if the external attempt fails.
- Runs inside CI using a local Postgres service to avoid production costs.

Files
- `server/scripts/safe-vin-run.ts` — small script that performs a safe VIN run; uses `DATABASE_URL` and `SAFE_VIN` env vars.
- `server/src/services/nags-lookup/__tests__/vin-e2e.test.ts` — vitest harness that mocks externals and asserts single external call.
- `docs/codebase-audit.md` — higher-level audit notes.

How to run locally (safe)
1. Ensure you have a test Postgres DB or use your `.env` with a test `DATABASE_URL`.
2. From repo root:
```bash
cd server
# install deps if you haven't already
npm ci
# run the safe script (reads .env by default)
npx tsx scripts/safe-vin-run.ts
```
3. To run the vitest E2E harness:
```bash
cd server
npx vitest run src/services/nags-lookup/__tests__/vin-e2e.test.ts --run
```

CI
- The repository includes a GitHub Action job `nags-e2e` that runs on pushes to `main` and uses a Postgres service to execute the safe VIN script.
- This job avoids production services and ensures the orchestration flow is exercised for regressions.

Production notes
- To run a live VIN lookup (not recommended in tests): ensure `DATABASE_URL` points to a non-production test DB and `ENCRYPTION_KEY` and other secrets are set.
- For production deployments, set a cost budget alert and enable feature-flag gating for scrapers/omega calls to prevent runaway costs.

Troubleshooting
- If tests complain about `@shared/schema`, build the `shared` package first:
```bash
npm --workspace=shared run build
```
- If Vitest cannot resolve `@shared/schema` at runtime, add a `vitest.config.ts` with an alias mapping to `../shared/schema.ts`.
 - If Vitest cannot resolve `@shared/schema` at runtime, add a `vitest.config.ts` with an alias mapping to `../shared/schema.ts`.
	 - A sample `server/vitest.config.ts` has been added to the project to resolve this mapping for server tests.

Recommended follow-ups
- Add a small metrics guard that prevents more than N Omega calls per hour when the retry queue has more than M entries.
- Add monitoring/alerting for retry queue growth and dead-letter entries.
