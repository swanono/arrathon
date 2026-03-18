# Story 1.4: Expo Mobile App Bootstrap

Status: review

## Story

As a developer,
I want `apps/mobile` set up with Expo Router, Zustand, @rn-primitives, and react-native-unistyles,
so that the mobile app boots on iOS/Android and connects to the API.

## Acceptance Criteria

1. `apps/mobile` exists as an Expo SDK 55 project with Expo Router file-based routing
2. Root layout (`app/_layout.tsx`) wraps the app with providers (unistyles, etc.)
3. `(auth)` group exists with a `login.tsx` placeholder screen
4. `(app)` group exists with a `_layout.tsx` (tab navigator placeholder) and `index.tsx` (home placeholder)
5. `useAuthStore` (Zustand) is initialized with `{ user, accessToken, login, logout }` shape and accessible throughout the app
6. react-native-unistyles v3 is configured with a theme containing colors, spacing, and typography tokens; dark/light theme support
7. `EXPO_PUBLIC_API_URL=http://localhost:3000` is set in `apps/mobile/.env`
8. `eas.json` is configured with `development` (dev client) and `production` profiles
9. `pnpm --filter @arrathon/mobile start` launches Expo Metro bundler without errors

## Tasks / Subtasks

- [x] **Task 1 — Scaffold Expo app** (AC: 1)
  - [x] Run `pnpm dlx create-expo-app@latest apps/mobile --template blank-typescript` from repo root
  - [x] Remove default boilerplate (App.tsx, index.ts) — bare minimum kept
  - [x] Update `package.json` name to `@arrathon/mobile`, main to `expo-router/entry`
  - [x] Add `@repo/typescript-config` devDep, tsconfig with path aliases

- [x] **Task 2 — Configure Expo Router** (AC: 2, 3, 4)
  - [x] `expo-router` installed, `app.json` updated with `scheme`, `web.bundler: metro`, `plugins: ["expo-router"]`
  - [x] Create `app/_layout.tsx` — root layout with Stack navigator + unistyles side-effect import
  - [x] Create `app/(auth)/login.tsx` — placeholder login screen
  - [x] Create `app/(app)/_layout.tsx` — Tab navigator with theme colors
  - [x] Create `app/(app)/index.tsx` — placeholder home screen

- [x] **Task 3 — Install and configure Zustand store** (AC: 5)
  - [x] `zustand` ^5.0.12 added to dependencies
  - [x] Create `src/stores/use-auth-store.ts` with `{ user, accessToken, login, logout }` shape

- [x] **Task 4 — Install and configure react-native-unistyles v3** (AC: 6)
  - [x] `react-native-unistyles` ^3.1.1 added to dependencies
  - [x] Create `src/styles/theme.ts` — design tokens: #00C853 primary, #0F172A navy, dark/light themes, 3D shadow tokens
  - [x] Create `src/styles/unistyles.ts` — register themes with adaptiveThemes
  - [x] Side-effect import in `app/_layout.tsx`

- [x] **Task 5 — Environment + EAS config** (AC: 7, 8)
  - [x] `apps/mobile/.env` with `EXPO_PUBLIC_API_URL=http://localhost:3000`
  - [x] `eas.json` with `development` (dev client) and `production` profiles

- [x] **Task 6 — Verify** (AC: 9)
  - [x] `CI=1 pnpm --filter @arrathon/mobile exec expo start` — Metro bundler starts without errors

## Dev Notes

### Architecture Compliance

```
apps/mobile/
├── app/                          ← Expo Router — file-based routing
│   ├── _layout.tsx               ← Root layout (Stack, providers)
│   ├── (auth)/
│   │   └── login.tsx             ← Login screen placeholder
│   └── (app)/
│       ├── _layout.tsx           ← Tab navigator placeholder
│       └── index.tsx             ← Home screen placeholder
├── src/
│   ├── stores/
│   │   └── use-auth-store.ts     ← Zustand auth store
│   └── styles/
│       ├── theme.ts              ← Design tokens
│       └── unistyles.ts          ← Unistyles config
├── app.json
├── eas.json
├── .env
├── package.json
└── tsconfig.json
```

---

### Package Versions (Expo SDK 55)

| Package | Version | Notes |
|---|---|---|
| `expo` | `~55.0.6` | SDK 55 |
| `expo-router` | `~55.0.5` | File-based routing (latest for SDK 55) |
| `react-native` | per expo peer deps | Auto-managed by Expo |
| `react-native-unistyles` | `^3.1.1` | v3 — breaking changes from v2, new API |
| `zustand` | `^5.0.12` | State management |
| `@rn-primitives/slot` | `^1.2.0` | Used for composable UI (add others as needed) |

---

### Expo Router Setup (SDK 55)

`app.json` must have:
```json
{
  "expo": {
    "scheme": "arrathon",
    "web": { "bundler": "metro" }
  }
}
```

Root layout pattern:
```typescript
// app/_layout.tsx
import { Stack } from 'expo-router'
import '../src/styles/unistyles'  // side-effect import — registers themes

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
```

---

### Zustand Store Shape

```typescript
// src/stores/use-auth-store.ts
import { create } from 'zustand'

type User = {
  id: string
  name: string
  familyName: string
  email: string
  avatarUrl: string | null
}

type AuthStore = {
  user: User | null
  accessToken: string | null
  login: (user: User, accessToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  login: (user, accessToken) => set({ user, accessToken }),
  logout: () => set({ user: null, accessToken: null }),
}))
```

**Critical:** Access token NEVER in AsyncStorage — memory only (Zustand). This is per architecture spec.

---

### react-native-unistyles v3 Setup

v3 is a significant rewrite from v2. Key differences:
- Uses `UnistylesRuntime` instead of `StyleSheet`
- Theme registration is done via `UnistylesRegistry`
- Babel plugin required

**`src/styles/theme.ts`:**
```typescript
export const lightTheme = {
  colors: {
    primary: '#6366f1',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    error: '#ef4444',
    success: '#22c55e',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    fontSizeXs: 12,
    fontSizeSm: 14,
    fontSizeMd: 16,
    fontSizeLg: 18,
    fontSizeXl: 24,
    fontSizeXxl: 32,
    fontWeightNormal: '400' as const,
    fontWeightMedium: '500' as const,
    fontWeightBold: '700' as const,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },
}

export const darkTheme: typeof lightTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#334155',
  },
}

export type AppTheme = typeof lightTheme
```

**`src/styles/unistyles.ts`:**
```typescript
import { UnistylesRegistry } from 'react-native-unistyles'
import { lightTheme, darkTheme } from './theme'

type AppThemes = {
  light: typeof lightTheme
  dark: typeof darkTheme
}

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
}

UnistylesRegistry.addThemes({
  light: lightTheme,
  dark: darkTheme,
}).addConfig({
  adaptiveThemes: true,  // follows system dark/light preference
})
```

---

### eas.json

```json
{
  "cli": { "version": ">= 16.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  }
}
```

---

### package.json Naming Convention

```json
{
  "name": "@arrathon/mobile",
  "version": "0.0.0",
  "private": true
}
```

Dev script: `"start": "expo start"` — use `pnpm --filter @arrathon/mobile start`

---

### tsconfig.json

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "jsx": "react-native",
    "lib": ["ESNext"],
    "allowJs": true,
    "noEmit": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.d.ts", "expo-env.d.ts"]
}
```

Note: Expo projects need `allowImportingTsExtensions: true` and `noEmit: true` — Expo handles the build, not tsc.

---

### From Story 1.3 — Key Learnings

- Single quotes everywhere, no extensions in imports
- `moduleResolution: Bundler` across the monorepo
- Root `.env` loaded via `src/env.ts` side-effect import (API side) — mobile uses `EXPO_PUBLIC_*` vars natively (Expo handles this)
- `pnpm` only — never `npm` in this project

---

### Testing Standards

No unit tests for this bootstrap story. Validation is via:
- `pnpm --filter @arrathon/mobile start` — Metro starts without errors
- Manual: app loads on simulator/device with Expo Go or dev build

---

### References

- Story requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 1, Story 1.4]
- Architecture: [Source: `_bmad-output/planning-artifacts/architecture.md` — Frontend Architecture (Mobile), Project Structure]
- Previous story: [Source: `_bmad-output/implementation-artifacts/1-3-oauth-google-migration-to-hono-cleanup.md`]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `react-native-unistyles` v3 has NO Expo config plugin — do NOT add it to `plugins` in app.json
- `expo-router/entry` must be the `main` field in package.json (not `index.ts`)
- `react-native-safe-area-context` and `react-native-screens` pinned to `~5.6.2` and `~4.23.0` to match Expo SDK 55 expected versions
- Design tokens: primary `#00C853`, navy `#0F172A`, 3D shadow tokens defined but used sparingly
- `adaptiveThemes: true` in unistyles config — auto follows system dark/light preference

### File List

- `apps/mobile/package.json` (modified)
- `apps/mobile/app.json` (modified)
- `apps/mobile/tsconfig.json` (modified)
- `apps/mobile/eas.json` (created)
- `apps/mobile/.env` (created)
- `apps/mobile/app/_layout.tsx` (created)
- `apps/mobile/app/(auth)/login.tsx` (created)
- `apps/mobile/app/(app)/_layout.tsx` (created)
- `apps/mobile/app/(app)/index.tsx` (created)
- `apps/mobile/src/stores/use-auth-store.ts` (created)
- `apps/mobile/src/styles/theme.ts` (created)
- `apps/mobile/src/styles/unistyles.ts` (created)
