# Story 1.5: CI/CD Pipeline & Railway Deployment

Status: review

## Story

As a developer,
I want GitHub Actions CI/CD configured and the API deployed on Railway,
so that every push to `main` triggers automated validation and deploys the API automatically.

## Acceptance Criteria

1. `.github/workflows/ci.yml` exists — runs lint and type-check on every PR against `main`, blocks merge on failure
2. `.github/workflows/deploy.yml` exists — deploys the API to Railway on every push to `main`
3. Railway project configured with PostgreSQL + PostGIS enabled
4. Environment variables set in Railway: `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URI`
5. `GET /health` on the Railway public URL returns `{ "data": { "status": "ok" } }`

## Tasks / Subtasks

- [x] Task 1: Rename and finalize CI workflow (AC: #1)
  - [x] Rename `.github/workflows/pull-request.yml` → `ci.yml`
  - [x] Keep existing checks: `type:check lint:check format:check` via Turbo
  - [x] Ensure it only triggers on `pull_request` targeting `main`

- [ ] Task 2: Create Railway project and configure service (AC: #3, #4) — MANUAL STEPS REQUIRED
  - [ ] Create Railway project via railway.app dashboard
  - [ ] Add PostgreSQL plugin → enable PostGIS extension via Railway console: `CREATE EXTENSION IF NOT EXISTS postgis;`
  - [ ] Set environment variables in Railway service settings:
    - `DATABASE_URL` → auto-provided by Railway PostgreSQL plugin
    - `JWT_SECRET` → generate a strong random secret
    - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` → from Google Cloud Console
    - `GOOGLE_CALLBACK_URI` → `https://<railway-url>/auth/google/callback`
  - [ ] Configure build and start commands in Railway service settings (or via railway.toml — already created)
  - [ ] Get Railway project token from Railway dashboard → Project Settings → Tokens
  - [ ] Add `RAILWAY_TOKEN` as GitHub repository secret (Settings → Secrets → Actions)

- [x] Task 3: Create deploy workflow (AC: #2)
  - [x] Create `.github/workflows/deploy.yml`
  - [x] Trigger: `push` to `main`
  - [x] Use Railway CLI to deploy
  - [x] Pass `RAILWAY_TOKEN` from GitHub secrets

- [x] Task 4: Create `railway.toml` in repo root for Railway Nixpacks config (AC: #5)
  - [x] Define `[build]` and `[deploy]` sections

- [ ] Task 5: Verify end-to-end (AC: #5) — requires Task 2 completion
  - [ ] Push to main → confirm GitHub Action triggers and succeeds
  - [ ] `curl https://<railway-url>/health` returns `{ "data": { "status": "ok" } }`

## Dev Notes

### Context: What Already Exists

- `.github/workflows/pull-request.yml` — already runs `type:check lint:check format:check` via Turbo on PRs. **Rename this to `ci.yml`**, do not recreate from scratch.
- `turbo.json` — has `build`, `type:check`, `lint:check`, `format:check` tasks
- `apps/api/package.json` scripts: `dev` (tsx watch), `build` (tsc), `start` (node dist/index.js), `type:check`
- `apps/api/src/index.ts` serves on port `process.env.PORT || 3000` — **Railway injects `PORT` automatically**, make sure the app uses it

### Critical: Port binding

Railway injects a `PORT` env var. The Hono server in `apps/api/src/index.ts` must use it:
```typescript
const port = parseInt(process.env.PORT ?? '3000')
serve({ fetch: app.fetch, port })
```
If hardcoded to 3000, Railway health checks will fail.

### CI Workflow (`ci.yml`) — minimal change from existing

```yaml
name: CI

on:
  pull_request:
    branches:
      - main

jobs:
  checks:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm dlx turbo run type:check lint:check format:check
```

### Deploy Workflow (`deploy.yml`)

```yaml
name: Deploy to Railway

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - uses: railwayapp/railway-action@v1
        with:
          service: api
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

> If `railwayapp/railway-action@v1` is deprecated, use Railway CLI:
> ```yaml
> - run: npx @railway/cli@latest up --service api --detach
>   env:
>     RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
> ```

### `railway.toml` (root of repo)

```toml
[build]
builder = "nixpacks"
buildCommand = "pnpm install --frozen-lockfile && pnpm --filter @arrathon/db db:migrate && pnpm --filter @arrathon/api build"

[deploy]
startCommand = "node apps/api/dist/index.js"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "on_failure"
```

### PostGIS on Railway

Railway's PostgreSQL plugin does NOT include PostGIS by default. After adding the PostgreSQL plugin:
1. Open Railway dashboard → PostgreSQL service → Connect tab → copy connection string
2. Run via psql: `CREATE EXTENSION IF NOT EXISTS postgis;`
Or use the Railway CLI: `railway run --service postgresql psql -c "CREATE EXTENSION IF NOT EXISTS postgis;"`

Alternatively, add the migration in `libs/db/drizzle/migrations` so it runs automatically during deploy.

### pnpm on Railway / Nixpacks

Nixpacks auto-detects `pnpm` via `packageManager` in root `package.json` (already set to `pnpm@9.0.0`). No extra config needed.

The `--frozen-lockfile` flag ensures Railway uses the exact lockfile — critical for reproducible deploys.

### Architecture Compliance

- **API hosting:** Railway (PostgreSQL managed + PostGIS) [Source: architecture.md#Infrastructure & Deployment]
- **CI/CD:** GitHub Actions — tests + deploy on push `main` [Source: architecture.md#Infrastructure & Deployment]
- **Environments:** `dev` (local) + `prod` (Railway), no staging [Source: architecture.md#Infrastructure & Deployment]
- **No lint script in API package.json**: `lint:check` is defined in turbo.json but not in `apps/api/package.json` — Turbo skips packages without the script, this is fine

### Project Structure

```
arrathon/
├── .github/
│   └── workflows/
│       ├── ci.yml          # renamed from pull-request.yml
│       └── deploy.yml      # NEW
├── railway.toml            # NEW — Nixpacks build/deploy config
```

### References

- [Source: planning-artifacts/epics.md#Story 1.5]
- [Source: planning-artifacts/architecture.md#Infrastructure & Deployment]
- [Source: planning-artifacts/architecture.md#AR8, AR9]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- ✅ `pull-request.yml` renamed to `ci.yml`, name updated to "CI", added `--frozen-lockfile`
- ✅ `.github/workflows/deploy.yml` created — triggers on push to main, uses Railway CLI with `RAILWAY_SERVICE_ID` secret
- ✅ `railway.toml` created — Nixpacks build, db:migrate in start command (not build), health check `/health`
- ✅ `dist/` added to root `.gitignore`
- ✅ `PORT` already properly configured in `apps/api/src/index.ts` (`process.env.PORT ?? 3000`)
- ✅ `apps/api` switched from `tsc` to `tsup` — fixes ESM module resolution in prod (Node.js requires .js extensions, tsup bundles into single file)
- ✅ `libs/db` — added `tsup.config.ts` + `build` script, exports updated from `src/*.ts` → `dist/*.js`
- ✅ `railway.toml` build command updated to build `@arrathon/db` before `@arrathon/api`
- ✅ Railway deployed successfully — `GET /health` returns `{"data":{"status":"ok"}}`
- ⚠️ Railway manual setup done by Sacha: PostgreSQL plugin, env vars, RAILWAY_TOKEN + RAILWAY_SERVICE_ID GitHub secrets

### Unplanned Changes (deviations from story spec)

- `db:migrate` moved from build command to start command — `DATABASE_URL` only available at runtime on Railway, not during build
- `deploy.yml` uses `RAILWAY_SERVICE_ID` secret instead of service name — Railway CLI requires ID not display name
- `apps/api` build tooling changed from `tsc` to `tsup` — ESM module resolution fix
- `libs/db` gained a build step — was previously exporting raw `.ts` sources (dev-only setup), needed proper `dist/` for prod

### File List

- `.github/workflows/ci.yml` (renamed from `pull-request.yml`, updated)
- `.github/workflows/deploy.yml` (new)
- `railway.toml` (new, updated)
- `.gitignore` (added `dist/`)
- `apps/api/package.json` (build script: tsc → tsup)
- `apps/api/tsup.config.ts` (new)
- `libs/db/package.json` (exports: src/*.ts → dist/*.js, build script added)
- `libs/db/tsup.config.ts` (new)
- `pnpm-lock.yaml` (updated)
