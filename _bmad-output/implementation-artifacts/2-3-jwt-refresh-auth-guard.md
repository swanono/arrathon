# Story 2.3: JWT Refresh & Auth Guard

Status: review

## Story

As a user,
I want my session to stay active seamlessly without being logged out unexpectedly,
So that I can use the app throughout a full arrathon day without interruption.

## Acceptance Criteria

1. Given my access token has expired (after 15 min), when the app makes any authenticated API request, then the fetch interceptor in `api/client.ts` detects the 401, automatically calls `POST /auth/refresh`, retries the original request with the new token, and if refresh also fails, redirects to login
2. Given I try to access a protected screen `(app)/*` while unauthenticated, then I am redirected to `/(auth)/login` automatically

## Tasks / Subtasks

- [x] Task 1: Add 401 interceptor to `api/client.ts` (AC: #1)
  - [x] On 401 response: read refresh token from SecureStore, call `/auth/refresh` directly via `fetch` (not apiFetch — évite la récursion infinie)
  - [x] On success: update store with new access token, retry original request
  - [x] On failure: clear SecureStore + store + redirect to login

- [x] Task 2: Add auth guard to `(app)/_layout.tsx` (AC: #2)
  - [x] Watch `accessToken` from store; if null → `router.replace('/(auth)/login')`

## Dev Notes

### Concept : pourquoi deux mécanismes ?

- **Intercepteur** : gère l'expiration EN COURS d'utilisation (token expire pendant la session active)
- **Auth guard** : gère l'accès DIRECT à une route protégée sans être connecté (deep link, redirect manuel)

### Piège classique : récursion infinie

Si `apiFetch` appelle `refreshToken()` qui lui-même appelle `apiFetch('/auth/refresh')` → boucle infinie sur 401.
Fix : dans l'intercepteur, appeler `fetch()` directement pour le refresh, pas `apiFetch`.

### Piège : race condition

Si 3 requêtes partent en même temps et reçoivent toutes un 401, on appellera refresh 3 fois.
Pour le MVP, on accepte ce comportement (rare en pratique). Solution future : singleton promise de refresh.

### Auth Guard timing

Au démarrage, `accessToken` est null AVANT que le silent refresh ait tourné. Mais le root `_layout.tsx` ne navigue vers `/(app)` qu'APRÈS avoir set le token. Donc quand `(app)/_layout.tsx` monte, le token est déjà là → pas de faux redirect.

Le guard sert surtout pour le logout : quand `storeLogout()` met `accessToken` à null, le useEffect réagit et redirige.

### Coding standards

- Single quotes, pas d'extensions dans les imports, pnpm only

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Completion Notes List

- ✅ `client.ts` — intercepteur 401 : refresh via `fetch` direct → retry → ou logout forcé
- ✅ `(app)/_layout.tsx` — auth guard : useEffect sur `accessToken`, redirect login si null
- ℹ️ Pas de tests : aucune infra de test configurée dans le projet (ni jest ni testing-library)

### File List

- `apps/mobile/src/api/client.ts` (modified)
- `apps/mobile/app/(app)/_layout.tsx` (modified)
