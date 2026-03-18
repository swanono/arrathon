# Story 1.2: Hono API Bootstrap

Status: done

## Story

As a developer,
I want `apps/api` set up with Hono + CORS + global error middleware,
so that the API server starts and handles requests consistently with the architectural patterns.

## Acceptance Criteria

1. `apps/api` package exists with `hono`, `@hono/node-server`, `@hono/cors`, `@hono/zod-validator`, `zod`, `@arrathon/db`
2. `GET /health` returns `{ "data": { "status": "ok" } }` with HTTP 200
3. CORS is configured via `@hono/cors` allowing `http://localhost:8081` (Expo dev) and `http://localhost:3000`
4. `DomainError` class exists at `src/domain/errors/domain-error.ts` with `code` and `statusCode` properties
5. Global error middleware (`app.onError`) transforms `DomainError` → `{ "error": { "code": string, "message": string } }` with correct HTTP status
6. Unknown errors return `{ "error": { "code": "INTERNAL_ERROR", "message": "Internal server error" } }` with HTTP 500
7. The Drizzle `db` client from `@arrathon/db` is imported and used in a health check DB ping
8. `pnpm --filter @arrathon/api dev` starts the server on port 3000
9. Turborepo `dev` task runs `apps/api` correctly; `apps/api` depends on `libs/db` in build order

## Tasks / Subtasks

- [x] **Task 1 — Create `apps/api` package** (AC: 1, 9)
  - [x] Create `apps/api/package.json` — name `@arrathon/api`, scripts `dev`/`build`/`start`, deps listed below
  - [x] Create `apps/api/tsconfig.json` extending `@repo/typescript-config/base.json`
  - [x] Run `pnpm install` to link workspace

- [x] **Task 2 — Create `DomainError`** (AC: 4)
  - [x] Create `apps/api/src/domain/errors/domain-error.ts`
  - [x] Export `DomainError` class with `code: string`, `statusCode: number`, `message: string`

- [x] **Task 3 — Bootstrap Hono app** (AC: 2, 3, 5, 6, 7, 8)
  - [x] Create `apps/api/src/index.ts` — entry point, instanciates Hono app + registers middleware + routes + starts server
  - [x] Add CORS middleware via `hono/cors`
  - [x] Add global `app.onError` handler
  - [x] Add `GET /health` route with DB ping
  - [x] Wire `serve()` from `@hono/node-server` on port 3000

- [x] **Task 4 — Verify** (AC: 2, 5, 6, 7, 8)
  - [x] `pnpm --filter @arrathon/api dev` starts without errors
  - [x] `curl http://localhost:3000/health` returns `{ "data": { "status": "ok" } }`
  - [x] `tsc --noEmit` in `apps/api` — 0 TypeScript errors

## Dev Notes

### Architecture Compliance

`apps/api` is an **infrastructure + application + domain** package following hexagonal architecture. For Story 1.2, only the skeleton is needed — no full domain layers yet, just:

```
apps/api/src/
├── domain/
│   └── errors/
│       └── domain-error.ts     ← DomainError class
└── index.ts                    ← Hono app entry point
```

The route files, repositories, and application layer will be added in subsequent stories.

---

### Package Configuration

```json
// apps/api/package.json
{
  "name": "@arrathon/api",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node --watch dist/index.js",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@arrathon/db": "workspace:*",
    "@hono/cors": "^0.0.15",
    "@hono/node-server": "^1.13.7",
    "@hono/zod-validator": "^0.4.3",
    "hono": "^4.7.7",
    "zod": "^3.25.67"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@types/node": "^22.1.0",
    "typescript": "~5.8.2"
  }
}
```

> ⚠️ `"type": "module"` — ESM. The tsconfig must use `moduleResolution: NodeNext` (inherited from base). All imports **must use `.js` extension** in source files (TypeScript resolves `.ts` → `.js` at emit time with NodeNext).

> ⚠️ `dev` script: uses `tsc` first to emit to `dist/`, then `node --watch`. Alternative: use `tsx watch src/index.ts` for faster DX (no separate `dist/`). Recommend `tsx` for dev.

---

### tsconfig

```json
// apps/api/tsconfig.json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

> Note: no `allowImportingTsExtensions` here — `apps/api` **is compiled** (emits to `dist/`), unlike `libs/db` which uses source exports. Therefore import paths must use `.js` extensions (e.g. `import { foo } from './foo.js'`).

---

### DomainError Pattern

```typescript
// src/domain/errors/domain-error.ts
export class DomainError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message?: string,
  ) {
    super(message ?? code)
    this.name = 'DomainError'
  }
}
```

Usage:
```typescript
throw new DomainError('ARRATHON_NOT_FOUND', 404)
throw new DomainError('USER_NOT_PARTICIPANT', 403, 'You are not a participant of this arrathon')
```

---

### Hono App Entry Point Pattern

```typescript
// src/index.ts
import { Hono } from 'hono'
import { cors } from '@hono/cors'
import { serve } from '@hono/node-server'
import { db } from '@arrathon/db'
import { DomainError } from './domain/errors/domain-error.js'

const app = new Hono()

// CORS — allow Expo dev + local frontend
app.use('*', cors({
  origin: ['http://localhost:8081', 'http://localhost:3000'],
  credentials: true,
}))

// Health check
app.get('/health', async (c) => {
  // Light DB ping to confirm connection
  await db.execute(sql`SELECT 1`)
  return c.json({ data: { status: 'ok' } })
})

// Global error handler — MUST be registered last
app.onError((err, c) => {
  if (err instanceof DomainError) {
    return c.json({ error: { code: err.code, message: err.message } }, err.statusCode as any)
  }
  console.error(err)
  return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, 500)
})

const port = Number(process.env.PORT ?? 3000)
serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`)
})

export default app
```

> Import `.js` extensions for local modules (NodeNext resolution). External packages (`hono`, `@arrathon/db`) don't need extensions.

---

### Dev Script — use `tsx` for fast dev loop

Instead of `tsc` + `node --watch`, use `tsx` for instant TypeScript execution with no compile step:

```json
"scripts": {
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "type:check": "tsc --noEmit"
},
"devDependencies": {
  "tsx": "^4.19.2"
}
```

This matches how most Hono + Node.js projects work in development.

---

### Turborepo Update

Ensure `apps/api` dev task is persistent and depends on `libs/db` build. The root `turbo.json` already has `"dev": { "cache": false, "persistent": true }` and `"build": { "dependsOn": ["^build"] }` — this already handles dependency ordering correctly because `apps/api` will declare `@arrathon/db` as a workspace dependency.

Add `type:check` script to `apps/api/package.json` so it participates in the root `turbo run type:check`.

---

### CORS Configuration Details

For MVP dev, allow:
- `http://localhost:8081` — Expo Metro bundler dev port
- `http://localhost:3000` — Same-origin (local test)

`credentials: true` is required for HttpOnly cookie refresh token flow (Stories 1.3+).

---

### Library Versions (as of 2026-03-17)

| Package | Version | Notes |
|---|---|---|
| `hono` | `^4.7.7` | Stable v4. DO NOT use v3. |
| `@hono/node-server` | `^1.13.7` | Node.js adapter for Hono |
| `@hono/cors` | `^0.0.15` | CORS middleware |
| `@hono/zod-validator` | `^0.4.3` | Zod validation middleware (used from Story 1.3+) |
| `tsx` | `^4.19.2` | Fast TS execution, dev only |

---

### Testing Standards

No unit tests for this bootstrap story. Validation is via:
- `curl http://localhost:3000/health` → manual test
- `pnpm type:check` → 0 TypeScript errors

Co-located tests (`.test.ts`) will be added starting from domain logic stories.

---

### From Story 1.1 — Key Learnings

- Use **single quotes** everywhere in TypeScript files
- `libs/db` exports via source pattern (`allowImportingTsExtensions: true`). When `apps/api` imports `from '@arrathon/db'`, it resolves to `libs/db/src/index.ts` directly — no build needed for `libs/db` at runtime in dev.
- `DATABASE_URL` is already in root `.env` — `apps/api` can read it from there or define its own `.env`

---

### Project Structure — Files to Create

```
apps/api/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    └── domain/
        └── errors/
            └── domain-error.ts
```

### References

- Story requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 1, Story 1.2]
- Architecture: [Source: `_bmad-output/planning-artifacts/architecture.md` — Structure Patterns, Format Patterns, Process Patterns]
- Hono docs: https://hono.dev/docs/getting-started/nodejs
- Previous story: [Source: `_bmad-output/implementation-artifacts/1-1-database-schema-migration-to-drizzle-orm.md`]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `moduleResolution: Bundler` + `module: ESNext` in `libs/typescript-config/base.json` — required for extension-free imports across the monorepo
- `"type": "module"` added to `libs/db/package.json` — without it, tsx treated the package as CJS and ESM named exports (`db`, `users`, …) were inaccessible
- CORS imported from `hono/cors` (built-in), not `@hono/cors` (separate package not installed)
- `dotenv` added as runtime dep to `apps/api` — loaded via `import 'dotenv/config'` side-effect at top of `index.ts`

### File List

- `libs/typescript-config/base.json` (modified)
- `libs/db/package.json` (modified — added `"type": "module"`)
- `apps/api/package.json` (created)
- `apps/api/tsconfig.json` (created)
- `apps/api/.env` (created)
- `apps/api/src/index.ts` (created)
- `apps/api/src/domain/errors/domain-error.ts` (created)
