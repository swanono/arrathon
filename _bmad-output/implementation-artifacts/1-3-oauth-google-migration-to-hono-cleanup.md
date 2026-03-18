# Story 1.3: OAuth Google Migration to Hono + Cleanup

Status: review

## Story

As a developer,
I want the existing OAuth Google flow migrated from Fastify to Hono using the `arctic` library,
so that authentication works end-to-end on the new API and `apps/backend` can be deleted.

## Acceptance Criteria

1. `GET /auth/google` redirects the user to Google's authorization page
2. `GET /auth/google/callback` creates or updates the user in DB and issues tokens:
   - JWT access token (15 min expiry) returned in response body as `{ data: { accessToken, user } }`
   - JWT refresh token (30 days) set as an HttpOnly cookie named `refresh_token`
3. `POST /auth/refresh` reads the HttpOnly cookie and returns a new access token `{ data: { accessToken } }`
4. `POST /auth/logout` clears the refresh token cookie and returns `{ data: { success: true } }`
5. An `auth-middleware.ts` exists that verifies the `Authorization: Bearer <token>` header and injects user into context — returns `DomainError('UNAUTHORIZED', 401)` for invalid/missing tokens
6. `apps/backend` (Fastify) is fully deleted from the monorepo (removed from pnpm workspace and turbo)
7. `tsc --noEmit` on `apps/api` passes with 0 errors
8. `pnpm --filter @arrathon/api dev` starts and `GET /health` still returns `{ data: { status: 'ok' } }`

## Tasks / Subtasks

- [x] **Task 1 — Install dependencies** (AC: 1, 2)
  - [x] Add `arctic` ^3.7.0 to `apps/api` dependencies
  - [x] Run `pnpm install`

- [x] **Task 2 — Application layer — use cases** (AC: 2, 3)
  - [x] Create `apps/api/src/application/auth/google-oauth.ts` — `handleGoogleCallback` use case
  - [x] Create `apps/api/src/application/auth/refresh-token.ts` — `refreshAccessToken` use case

- [x] **Task 3 — Infrastructure layer — routes** (AC: 1, 2, 3, 4)
  - [x] Create `apps/api/src/infrastructure/http/routes/auth.routes.ts` with all 4 auth endpoints
  - [x] Register auth routes in `apps/api/src/index.ts`

- [x] **Task 4 — Infrastructure layer — middleware** (AC: 5)
  - [x] Create `apps/api/src/infrastructure/http/middleware/auth-middleware.ts`
  - [x] Define Hono context variable types for `user`

- [x] **Task 5 — Delete apps/backend** (AC: 6)
  - [x] Delete `apps/backend/` directory
  - [x] `pnpm-workspace.yaml` uses `apps/*` glob — no explicit entry to remove
  - [x] `turbo.json` has no backend-specific references — no change needed

- [x] **Task 6 — Verify** (AC: 7, 8)
  - [x] `tsc --noEmit` on `apps/api` — 0 errors
  - [x] Server starts, `GET /health` → `{"data":{"status":"ok"}}`
  - [x] `GET /auth/google` → HTTP 302 redirect to Google

## Dev Notes

### Architecture Compliance

Files to create — strictly following hexagonal architecture:

```
apps/api/src/
├── application/
│   └── auth/
│       ├── google-oauth.ts        ← handleGoogleCallback use case
│       └── refresh-token.ts       ← refreshAccessToken use case
├── infrastructure/
│   └── http/
│       ├── middleware/
│       │   └── auth-middleware.ts ← JWT verification, injects user into context
│       └── routes/
│           └── auth.routes.ts     ← GET /auth/google, callback, refresh, logout
└── index.ts                       ← register auth routes here
```

Rule: `application/` imports from `domain/` and `@arrathon/db` only. `infrastructure/http/` orchestrates use cases — no business logic in routes.

---

### Library Versions

| Package | Version | Source |
|---|---|---|
| `arctic` | `^3.7.0` | OAuth Google abstraction (PKCE, state, token exchange) |
| `hono/jwt` | built-in | JWT sign + verify (already in `hono` dep) |

**Do NOT add `jose`, `jsonwebtoken`, or `@fastify/jwt`** — `hono/jwt` is the only JWT library needed.

---

### arctic v3 API — Critical Details

```typescript
import { Google, generateState, generateCodeVerifier, decodeIdToken, OAuth2RequestError } from 'arctic'

const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3000/auth/google/callback',
)

// Step 1 — Generate redirect URL
const state = generateState()
const codeVerifier = generateCodeVerifier()
const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email'])
// Store state + codeVerifier as HttpOnly cookies (10min maxAge) for CSRF protection

// Step 2 — Validate callback
const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier)
const idToken = tokens.idToken()
const claims = decodeIdToken(idToken)
// claims fields: sub (Google UID), email, email_verified, name, given_name, family_name, picture
```

**PKCE cookies (state + code_verifier):**
```typescript
setCookie(c, 'google_oauth_state', state, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Lax',
  maxAge: 600, // 10 minutes
  path: '/',
})
```

---

### JWT — hono/jwt API

```typescript
import { sign, verify } from 'hono/jwt'

const secret = process.env.JWT_SECRET!

// Access token — 15 minutes
const accessToken = await sign(
  { sub: user.id, email: user.email, name: user.name, exp: Math.floor(Date.now() / 1000) + 60 * 15 },
  secret,
)

// Refresh token — 30 days
const refreshToken = await sign(
  { sub: user.id, type: 'refresh', exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 },
  secret,
)

// Verify
const payload = await verify(token, secret)
```

---

### Refresh Token Cookie

```typescript
import { setCookie, deleteCookie } from 'hono/cookie'

// Set on callback
setCookie(c, 'refresh_token', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Lax',
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
})

// Clear on logout
deleteCookie(c, 'refresh_token', { path: '/' })
```

---

### Drizzle — Find or Create User

```typescript
import { db, users } from '@arrathon/db'
import { eq } from 'drizzle-orm'

// Find by googleId first (preferred), fallback by email
const existing = await db.query.users.findFirst({
  where: eq(users.googleId, googleId),
})

// Or insert
const [created] = await db.insert(users).values({
  name: given_name,
  familyName: family_name,
  email,
  googleId: sub,          // claims.sub from arctic decodeIdToken
  avatarUrl: picture,
}).returning()
```

Users schema columns (camelCase in Drizzle, snake_case in DB):
- `id` (uuid PK, auto-generated)
- `name`, `familyName`, `email`, `googleId`, `avatarUrl`
- `createdAt`, `updatedAt`

---

### auth-middleware.ts Pattern

```typescript
import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'
import { DomainError } from '../../../domain/errors/domain-error'

export const authMiddleware = createMiddleware<{
  Variables: { userId: string }
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new DomainError('UNAUTHORIZED', 401)
  }
  const token = authHeader.slice(7)
  try {
    const payload = await verify(token, process.env.JWT_SECRET!)
    c.set('userId', payload.sub as string)
  } catch {
    throw new DomainError('UNAUTHORIZED', 401)
  }
  await next()
})
```

---

### Route Registration in index.ts

```typescript
import { authRoutes } from './infrastructure/http/routes/auth.routes'

// Register under /auth prefix
app.route('/auth', authRoutes)
```

`authRoutes` is a `Hono` instance exported from `auth.routes.ts`:
```typescript
import { Hono } from 'hono'
export const authRoutes = new Hono()
authRoutes.get('/google', ...)
authRoutes.get('/google/callback', ...)
authRoutes.post('/refresh', ...)
authRoutes.post('/logout', ...)
```

---

### Environment Variables Required

Add to `apps/api/.env` (and Railway secrets for prod):
```
JWT_SECRET=<min 32 chars, random>
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

`apps/api/.env` already has `DATABASE_URL` and `PORT`.

---

### Delete apps/backend — Steps

1. `rm -rf apps/backend`
2. Check `pnpm-workspace.yaml` — remove `apps/backend` if explicitly listed (likely it uses glob `apps/*` so no change needed)
3. Check `turbo.json` — remove any explicit `backend` pipeline references if present

---

### DomainError Codes for Auth

- `UNAUTHORIZED` (401) — invalid/missing/expired token
- `OAUTH_FAILED` (500) — error during Google OAuth exchange
- `OAUTH_STATE_MISMATCH` (400) — state cookie mismatch (CSRF)

---

### From Story 1.2 — Key Learnings

- Single quotes everywhere, zero extensions in imports
- `moduleResolution: Bundler` in base tsconfig — extension-free imports work
- `@arrathon/db` package has `"type": "module"` — ESM named exports work
- `hono/cors` (built-in), not `@hono/cors`
- `hono/cookie` (built-in) for `setCookie`, `getCookie`, `deleteCookie`
- Drizzle client from `@arrathon/db` used directly — no build step needed

---

### References

- Story requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 1, Story 1.3]
- Architecture auth: [Source: `_bmad-output/planning-artifacts/architecture.md` — Authentication & Security, Project Structure]
- Previous story: [Source: `_bmad-output/implementation-artifacts/1-2-hono-api-bootstrap.md`]
- Existing OAuth: [Source: `apps/backend/src/plugins/oauth.ts`, `apps/backend/src/routes/api/auth/index.ts`]
- Arctic docs: https://arcticjs.dev/providers/google

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `hono/jwt` `verify` requires `alg` as 3rd argument (`'HS256'`) — not optional in Hono v4.12.x despite docs suggesting otherwise
- `drizzle-orm` added as direct dep to `apps/api` (for `eq` operator) — with `moduleResolution: Bundler` no dual-resolution conflict
- `arctic` v3 uses `decodeIdToken(tokens.idToken())` for getting user claims from Google — no separate userinfo HTTP call needed
- `pnpm-workspace.yaml` uses `apps/*` glob — deleting `apps/backend/` was enough, no config changes needed
- PKCE cookies (`google_oauth_state`, `google_code_verifier`) set HttpOnly with 10min TTL, cleared after callback

### File List

- `apps/api/package.json` (modified — added arctic, drizzle-orm)
- `apps/api/src/index.ts` (modified — added authRoutes)
- `apps/api/src/application/auth/google-oauth.ts` (created)
- `apps/api/src/application/auth/refresh-token.ts` (created)
- `apps/api/src/infrastructure/http/routes/auth.routes.ts` (created)
- `apps/api/src/infrastructure/http/middleware/auth-middleware.ts` (created)
- `apps/backend/` (deleted)
