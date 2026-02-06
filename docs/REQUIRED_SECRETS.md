# Required Repository Secrets

The scheduled monitor, CI, and runtime require a few repository secrets to operate correctly.

- `DATABASE_URL` — Postgres connection string used by CI and monitor jobs. Required.
- `MONITOR_DATABASE_URL` — Optional alternate secret name for the monitor job (kept for backward compatibility).
- `RETRY_QUEUE_THRESHOLD` — Numeric threshold used by the retry monitor to trigger alerts (e.g. `100`).
- `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` — Required for automated deploys to Vercel from workflows (if used).
- `GITHUB_TOKEN` — Provided automatically to Actions, used for opening issues; no manual action required unless you scope differently.

Add these at: Settings → Secrets and variables → Actions in your GitHub repository.
