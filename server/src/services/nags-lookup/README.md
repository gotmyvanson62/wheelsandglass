NAGS Lookup Service

Overview
- Implements a multi-tier NAGS lookup: cache -> distributors -> Omega fallback -> manual escalation.

Files
- `types.ts` - shared types for lookup results.
- `cache-service.ts` - persistent cache backed by Postgres.
- `index.ts` - orchestrator that runs the tiered lookup.
- `distributor-lookup.ts` - orchestrates distributor scrapers.
- `distributors/` - per-distributor scrapers (e.g., `mygrant.ts`).
- `omega-fallback.ts` - uses Omega pricing service as a fallback.
- `manual-escalation.ts` - inserts unresolved lookups into `nags_manual_queue`.

Setup
- Ensure database migrations are applied to create NAGS tables.
- Add distributor credentials into `distributor_credentials` table.

Environment
- The service relies on the same env vars as the server (see server README). For scraping you should add:
  - `ENCRYPTION_KEY` - used to encrypt distributor passwords in DB.

Extending
- To add a distributor, implement `BaseDistributorScraper` and export a class that performs `login()` and `lookupParts()`.
- Keep scrapers polite: use `politeDelay()` and respect robots.txt and TOS.

Testing
- Unit tests for scrapers are under `distributors/__tests__` and use `vitest`.

Security & Compliance
- Do not store plain-text credentials in the DB. Use `ENCRYPTION_KEY` to encrypt them.
- Confirm legal permissions before scraping any distributor portal.
