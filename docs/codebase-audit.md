Codebase Audit — quick findings

Summary
- The repo contains a consolidated `shared` package used as a TypeScript path alias (`@shared/schema`) across server and client.
- Several runtime tools (Vitest/Vite) can fail to resolve the TypeScript path alias at test/runtime unless an explicit runtime mapping or package export is available. This caused tests to fail during automated runs in this environment.
- Drizzle migrations exist and were run successfully earlier against the Neon DB.
- New NAGS cache schema and services were added; the code compiles after fixes.

Issues / Recommendations
- Runtime Module Alias: Ensure `@shared/schema` is resolvable at runtime. Options:
  - Add a package entry in `server/node_modules/@shared/schema` that re-exports `shared` compiled files (or build `shared/dist` and publish locally).
  - Configure Vitest/Vite to map the `@shared/schema` path to `../shared/schema.ts` via `resolve.alias` in `vitest.config.ts` / `vite.config.ts`.
- Tests: Unit tests run with vitest but some tests required mocking heavy DB modules. Add a `vitest.config.ts` alias mapping and shared test helpers to avoid ad-hoc mocking.
- Credentials & Secrets: Distributor credentials must be encrypted (`ENCRYPTION_KEY`) and not present in repository. Add deployment secrets in Vercel.
- Scrapers: Distributor scrapers are template/stubs; implement with explicit rate-limiting, user-agent, and legal checks before enabling.
- Retry Queue Policy: The repo implements a persistent `retry_queue`; ensure worker has backoff and dead-letter handling (already scaffolded). Recommend enabling secondary cost-protection: a "cost budget" gate preventing repeated Omega calls beyond a budget.

Files of interest
- `server/src/db/schema/nags-cache.ts` — NAGS tables (nags_cache, nags_manual_queue, distributor_credentials, nags_lookup_log).
- `server/src/services/nags-lookup/` — orchestrator and scrapers.
- `server/src/database-storage.ts` — heavy Drizzle-backed storage that imports `@shared/schema` at runtime.

Next steps
- Add `vitest` alias mapping and small `test-utils` that mock DB for unit tests.
- Implement production scrapers behind feature flags and credential vaults.
- Add CI job that runs the safe E2E harness (below) which uses mock externals and only one external attempt; failures enqueue retry entries.
