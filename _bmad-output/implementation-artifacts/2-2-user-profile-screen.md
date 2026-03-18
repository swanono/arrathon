# Story 2.2: User Profile Screen

Status: review

## Story

As a user,
I want to see my profile with my name and photo from Google,
So that I can confirm my identity and access account settings.

## Acceptance Criteria

1. Given I am authenticated, when I navigate to my profile screen, then I see my name, family name, and avatar photo (from Google)
2. I see a "Se déconnecter" button on the profile screen
3. Given I tap "Se déconnecter", then my access token is cleared from `useAuthStore`, the refresh token is deleted from SecureStore, `POST /auth/logout` is called, and I am redirected to the login screen

## Tasks / Subtasks

- [x] Task 1: Add logout function to auth API (AC: #3)
  - [x] Add `logout()` to `apps/mobile/src/api/auth.api.ts` — calls `POST /auth/logout`

- [x] Task 2: Create profile screen (AC: #1, #2, #3)
  - [x] Create `apps/mobile/app/(app)/profile.tsx`
  - [x] Display `user.name` + `user.familyName` and `user.email`
  - [x] Display avatar with `Image` component if `user.avatarUrl` exists, fallback initials if null
  - [x] "Se déconnecter" button: call `logout()` API, delete SecureStore `refresh_token`, call store `logout()`, redirect to `/(auth)/login`

- [x] Task 3: Add Profile tab to navigation (AC: #1)
  - [x] Update `apps/mobile/app/(app)/_layout.tsx` to add Profile tab

## Dev Notes

### Architecture

- **Styling**: `makeStyles(theme)` pattern + `useTheme()` from `src/theme` — NO react-native-unistyles
- **Components**: `Pressable`/`Text`/`Image` from React Native, styled with `makeStyles(theme)`
- **Single quotes**, no `.ts`/`.js` extensions in imports, pnpm only

### Auth Store

`useAuthStore` already has:
- `user: AuthUser | null` — `{ id, name, familyName, email, avatarUrl: string | null }`
- `logout()` — clears `user` and `accessToken`
- `accessToken: string | null`

### Logout Flow (Mobile)

Mobile uses SecureStore for refresh token (not cookie). Full logout:
1. Call `POST /auth/logout` via `apiFetch` (clears server-side cookie for web clients)
2. `SecureStore.deleteItemAsync('refresh_token')`
3. `useAuthStore.getState().logout()`
4. `router.replace('/(auth)/login')`

### Navigation

`app/(app)/_layout.tsx` uses `<Tabs>`. Add a second tab for profile using Expo Router file-based tabs — create `profile.tsx` in `(app)/` folder, it auto-registers as a tab.

### Previous Story Learnings

- Single quotes everywhere, no `.ts`/`.js` extensions in imports
- `makeStyles(theme)` pattern for all styled components
- pnpm only — never npm or yarn
- Ask before committing

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Completion Notes List

- ✅ `auth.api.ts` — ajout `logout()` : appelle `POST /auth/logout` avec `.catch(() => null)` (silencieux si offline)
- ✅ `profile.tsx` — affiche nom, prénom, email, avatar (Image ou initiales en fallback), bouton "Se déconnecter"
- ✅ Logout : appelle API → delete SecureStore → store.logout() → redirect login
- ✅ `(app)/_layout.tsx` — tabs Accueil + Profil explicites via `<Tabs.Screen>`

### File List

- `apps/mobile/src/api/auth.api.ts` (modified)
- `apps/mobile/app/(app)/profile.tsx` (new)
- `apps/mobile/app/(app)/_layout.tsx` (modified)
