# Story 2.1: Google Sign-In Screen & Auth Flow (Mobile)

Status: done

## Story

As a user,
I want to sign in with my Google account from the mobile app,
so that I can access the Arrathon app without creating a separate account.

## Acceptance Criteria

1. Given I open the app unauthenticated, when I tap "Se connecter avec Google", then the Google OAuth flow opens in a browser
2. After successful Google authorization, I am redirected back to the app
3. My JWT access token is stored in `useAuthStore` (memory only, not AsyncStorage)
4. The refresh token is stored in `expo-secure-store`
5. I am redirected to the app home screen `(app)/index`
6. Given I reopen the app after a previous session, when the app starts, then if a valid refresh token exists in SecureStore, a new access token is fetched automatically and I go directly to home

## Tasks / Subtasks

- [x] Task 1: Add API support for mobile OAuth redirect (AC: #2, #4)
  - [x] Modify `GET /auth/google` to accept `platform=mobile` query param
  - [x] Modify `GET /auth/google/callback` to redirect to `arrathon://auth/callback?...` when `platform=mobile`
  - [x] Modify `POST /auth/refresh` to also accept refresh token from request body

- [x] Task 2: Install mobile dependencies (AC: all)
  - [x] Add `expo-web-browser` to `apps/mobile/package.json`
  - [x] Add `expo-secure-store` to `apps/mobile/package.json`
  - [x] Run `pnpm install`

- [x] Task 3: Create API client and auth API module (AC: #3, #4, #6)
  - [x] Create `apps/mobile/src/api/client.ts`
  - [x] Create `apps/mobile/src/api/auth.api.ts`

- [x] Task 4: Update auth store (AC: #3, #4)
  - [x] Add `setAccessToken(token)` action to `useAuthStore`

- [x] Task 5: Implement login screen with Google button (AC: #1, #2)
  - [x] Update `app/(auth)/login.tsx` with Google button + 3D style
  - [x] `WebBrowser.openAuthSessionAsync` with `platform=mobile` param

- [x] Task 6: Handle OAuth callback deep link (AC: #2, #3, #4, #5)
  - [x] Create `app/(auth)/callback.tsx`
  - [x] User info passed via URL params (userId, name, familyName, email, avatarUrl)
  - [x] Store refreshToken in SecureStore, login in Zustand, redirect to `/(app)`

- [x] Task 7: Silent refresh on app start (AC: #6)
  - [x] `app/_layout.tsx` reads SecureStore on mount, calls refresh, redirects to `/(app)` or stays on login

## Dev Notes

### Architecture Deviations from Spec

- **Styling**: Architecture specifies `react-native-unistyles`, but this project uses **native `StyleSheet` + `ThemeContext`** (replaced in Story 1.4 refactor due to native module issues). Use `useTheme()` from `src/theme` for all styles.
- **@rn-primitives**: Architecture mentions it, but was NOT installed in Story 1.4. For this story, use basic React Native `Pressable`/`Text` components styled with `makeStyles(theme)`.

### Critical: Mobile OAuth Cookie Problem

The API currently sets the refresh token as an **HttpOnly cookie**. In React Native, `fetch` does NOT automatically send cookies — the cookie jar is not shared between `expo-web-browser` (which runs OAuth) and the JS fetch calls.

**Solution for mobile:**
- The OAuth callback redirects to `arrathon://auth/callback?accessToken=X&refreshToken=Y` (both tokens in URL)
- Mobile stores `refreshToken` in `expo-secure-store` (equivalent security to HttpOnly cookie on native)
- `POST /auth/refresh` is modified to accept `{ refreshToken }` in request body (in addition to cookie for web)

### API Changes Required

**`GET /auth/google`** — pass `platform` through PKCE state:
```typescript
// Encode platform in state: base64({ platform, randomState })
const statePayload = JSON.stringify({ s: state, p: platform ?? 'web' })
const encodedState = Buffer.from(statePayload).toString('base64url')
setCookie(c, 'google_oauth_state', encodedState, ...)
```

**`GET /auth/google/callback`** — detect mobile and redirect:
```typescript
// Decode state to check platform
const statePayload = JSON.parse(Buffer.from(state, 'base64url').toString())
if (statePayload.p === 'mobile') {
  const deepLink = `arrathon://auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
  return c.redirect(deepLink)
}
// else: existing JSON response for web/testing
return c.json({ data: { accessToken, user } })
```

**`POST /auth/refresh`** — accept body OR cookie:
```typescript
const refreshToken = getCookie(c, 'refresh_token') ?? (await c.req.json().catch(() => ({}))).refreshToken
```

### Mobile: expo-web-browser OAuth

```typescript
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'

const redirectUrl = Linking.createURL('/auth/callback')
const authUrl = `${process.env.EXPO_PUBLIC_API_URL}/auth/google?platform=mobile`

const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl)
// result.type === 'success' means user completed OAuth
// The deep link is handled by Expo Router automatically
```

### Mobile: Expo Router Deep Link Handling

`Linking.createURL('/auth/callback')` with `scheme: 'arrathon'` in `app.json` produces `arrathon://auth/callback`.

In Expo Router, create `app/(auth)/callback.tsx`. The route `(auth)/callback` matches `arrathon://auth/callback?accessToken=...`.

```typescript
// app/(auth)/callback.tsx
import { useLocalSearchParams, router } from 'expo-router'
import { useEffect } from 'react'
import * as SecureStore from 'expo-secure-store'
import { useAuthStore } from '../../src/stores/use-auth-store'

export default function AuthCallback() {
  const { accessToken, refreshToken } = useLocalSearchParams<{
    accessToken: string
    refreshToken: string
  }>()

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      router.replace('/(auth)/login')
      return
    }
    // Decode JWT to get user info
    const payload = JSON.parse(atob(accessToken.split('.')[1]))
    SecureStore.setItemAsync('refresh_token', refreshToken)
      .then(() => {
        useAuthStore.getState().login(
          { id: payload.sub, name: payload.name, familyName: payload.family_name,
            email: payload.email, avatarUrl: payload.picture ?? null },
          accessToken,
        )
        router.replace('/(app)')
      })
  }, [accessToken, refreshToken])

  return null // or a loading spinner
}
```

### JWT Payload Expected Fields

Looking at `handleGoogleCallback` in `apps/api/src/application/auth/google-oauth.ts` — the JWT is signed with `{ sub: userId }`. Check what fields are included in the token payload. If only `sub` is included, user info cannot be decoded from the token — in that case, add user to the deep link URL params:

```
arrathon://auth/callback?accessToken=X&refreshToken=Y&userId=Z&name=...
```

Read `apps/api/src/application/auth/google-oauth.ts` before implementing to verify JWT payload fields.

### Silent Refresh in `app/_layout.tsx`

```typescript
useEffect(() => {
  SecureStore.getItemAsync('refresh_token').then(async (token) => {
    if (!token) return // stays on login
    try {
      const { accessToken } = await refreshToken(token)
      useAuthStore.getState().setAccessToken(accessToken)
      router.replace('/(app)')
    } catch {
      await SecureStore.deleteItemAsync('refresh_token')
      // stays on login
    }
  })
}, [])
```

### API Client (`src/api/client.ts`)

```typescript
import { useAuthStore } from '../stores/use-auth-store'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL

export async function apiFetch(path: string, init?: RequestInit) {
  const token = useAuthStore.getState().accessToken
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string> ?? {}),
  }
  return fetch(`${BASE_URL}${path}`, { ...init, headers })
}
```

### Project Structure (files to create/modify)

```
apps/
├── api/
│   └── src/
│       ├── application/auth/google-oauth.ts    MODIFY (platform in state)
│       └── infrastructure/http/routes/auth.routes.ts  MODIFY (mobile redirect + body refresh)
└── mobile/
    ├── app/
    │   ├── _layout.tsx                         MODIFY (silent refresh on mount)
    │   └── (auth)/
    │       ├── login.tsx                       MODIFY (Google button)
    │       └── callback.tsx                    NEW
    └── src/
        ├── api/
        │   ├── client.ts                       NEW
        │   └── auth.api.ts                     NEW
        └── stores/
            └── use-auth-store.ts               MODIFY (add setAccessToken)
```

### Environment Variables

- `EXPO_PUBLIC_API_URL` — must be set in `apps/mobile/.env` for local dev (e.g. `http://192.168.1.x:3000`) and in EAS build config for prod (`https://arrathonapi-production.up.railway.app`)
- Note: `192.168.x.x` not `localhost` — the emulator/device cannot reach the host machine via `localhost`

### Previous Story Learnings (from Epic 1)

- **Single quotes** everywhere, no `.ts`/`.js` extensions in imports
- **`makeStyles(theme)`** pattern for all styled components, `useTheme()` from `src/theme`
- **pnpm only** — never npm or yarn
- **Ask before committing**
- `expo-web-browser` needs a dev build (not Expo Go) — already configured from Story 1.4 with EAS dev build
- `expo-secure-store` also requires native module → new EAS dev build needed after install

### References

- [Source: planning-artifacts/epics.md#Story 2.1]
- [Source: planning-artifacts/architecture.md#Authentication & Security]
- [Source: planning-artifacts/architecture.md#Frontend Architecture (Mobile)]
- [Source: implementation-artifacts/1-4-expo-mobile-app-bootstrap.md]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- ✅ API: `GET /auth/google` encode `platform` dans le `state` OAuth (base64url JSON) — plus fiable que cookie séparé
- ✅ API: callback décode le `state` pour extraire `platform`, redirige vers `arrathon://callback?tokens...` si mobile
- ✅ API: `POST /auth/refresh` accepte cookie OU body `{ refreshToken }`
- ✅ API: start script utilise `--env-file=../../.env` pour charger les vars avant l'init DB (fix `user "swanono"` auth error)
- ✅ Mobile: `expo-web-browser` + `expo-secure-store` installés
- ✅ Mobile: `src/api/client.ts` + `src/api/auth.api.ts` créés
- ✅ Mobile: `useAuthStore` — ajout `setAccessToken`
- ✅ Mobile: login screen avec bouton 3D vert
- ✅ Mobile: `app/(auth)/callback.tsx` — deep link handler (`arrathon://callback` → route `/callback`)
- ✅ Mobile: `app/_layout.tsx` — silent refresh au démarrage
- ✅ Mobile: fix TypeScript — `AppTheme` défini en interface explicite (problème `as const` littéraux)
- ✅ Flow validé end-to-end sur émulateur Android avec `adb reverse tcp:3000 tcp:3000`

### Décisions & Learnings

- **Platform dans state OAuth** : stocker `platform` dans un cookie séparé (`oauth_platform`) est peu fiable car le cookie domain peut diverger entre la requête initiale (`10.0.2.2`) et le callback (`localhost`). Solution : encoder `{ s: rawState, p: platform }` en base64url dans le `state` passé à Google — il revient garanti dans le callback comme query param.
- **Deep link path** : `app/(auth)/callback.tsx` → route Expo Router = `/callback` (les groupes `(auth)` ne s'ajoutent pas à l'URL). Le scheme mobile doit être `arrathon://callback`, pas `arrathon://auth/callback`.
- **Dev local émulateur Android** : nécessite `adb reverse tcp:3000 tcp:3000` à chaque démarrage de l'émulateur pour que `localhost:3000` dans le browser de l'émulateur pointe vers le host — indispensable pour le callback Google OAuth.
- **ESM + tsup + dotenv** : avec tsup bundle, `@arrathon/db` s'initialise avant que `env.ts` (dotenv) ne charge. Fix : `node --env-file=../../.env` dans le start script charge les vars avant tout module Node.
- ⚠️ EAS rebuild nécessaire — `expo-web-browser` et `expo-secure-store` sont des modules natifs

### File List

- `apps/api/package.json` (modified — --env-file dans start script)
- `apps/api/src/application/auth/google-oauth.ts` (modified — platform encodé dans state, ajout decodeOAuthState)
- `apps/api/src/infrastructure/http/routes/auth.routes.ts` (modified — encodedState, decode platform, redirect arrathon://callback)
- `apps/mobile/.env` (modified — EXPO_PUBLIC_API_URL=http://localhost:3000 pour cohérence cookies)
- `apps/mobile/app/_layout.tsx` (modified)
- `apps/mobile/app/(auth)/login.tsx` (modified — redirectUrl /callback)
- `apps/mobile/app/(auth)/callback.tsx` (new)
- `apps/mobile/src/api/client.ts` (new)
- `apps/mobile/src/api/auth.api.ts` (new)
- `apps/mobile/src/stores/use-auth-store.ts` (modified)
- `apps/mobile/src/theme/themes.ts` (modified — AppTheme explicit interface)
- `apps/mobile/package.json` (added expo-web-browser, expo-secure-store)
- `pnpm-lock.yaml` (updated)
