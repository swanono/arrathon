# Story 3.2: Invite Participants via Unique Link

Status: done

## Story

As an organiser,
I want to generate and share a unique invite link for my arrathon,
So that participants can join without needing an account beforehand.

## Acceptance Criteria

1. Given I am an organiser, when I tap "Inviter des participants", I see the invite link and can share it via native share sheet
2. Given a user opens `arrathon://join/:token` and is authenticated, they are added as participant and redirected to home
3. Given a user opens `arrathon://join/:token` and is NOT authenticated, they are redirected to login and auto-joined after auth
4. Given the token is invalid, an error is shown

## Tasks / Subtasks

- [x] Task 1: API — join endpoint (AC: #2, #4)
  - [x] Add `POST /arrathons/join/:token` — find by inviteToken, insert user_arrathon as participant, handle already-member + invalid token

- [x] Task 2: API — get arrathon detail (needed for invite token)
  - [x] Add `GET /arrathons/:id` — return arrathon + inviteToken for members

- [x] Task 3: Mobile — API functions (AC: #1, #2)
  - [x] Add `joinArrathon(token)` + `getArrathon(id)` to `arrathon.api.ts`

- [x] Task 4: Mobile — share invite from home screen (AC: #1)
  - [x] Update `index.tsx` cards: show "Partager" button using `Share` API for organisators

- [x] Task 5: Mobile — deep link join screen (AC: #2, #3, #4)
  - [x] Create `app/join/[token].tsx` — if authenticated: join + redirect home; if not: save pending_join_token to SecureStore + redirect login

- [x] Task 6: Mobile — auto-join after login (AC: #3)
  - [x] Update `(auth)/callback.tsx` — after login, check pending_join_token, call join API, clear token

## Dev Notes

### API: join endpoint
- Look up `arrathons` by `inviteToken`
- If not found → `DomainError('INVITE_INVALID', 404)`
- If user already member → return 200 silently (idempotent)
- Insert `user_arrathon` with `role: 'participant'`

### Deep link registration
`arrathon://join/:token` → `app/join/[token].tsx` via Expo Router (folder `app/join/`, file `[token].tsx`)
Must add `<Tabs.Screen href: null>` equivalent — but `join/` is outside `(app)/` so it uses root Stack layout.

### Pending join flow
1. `join/[token].tsx`: `SecureStore.setItemAsync('pending_join_token', token)` → `router.replace('/(auth)/login')`
2. `(auth)/callback.tsx`: after store.login(), check `SecureStore.getItemAsync('pending_join_token')` → call `joinArrathon(token)` → `SecureStore.deleteItemAsync('pending_join_token')`

### Coding standards
- Single quotes, no extensions in imports, English comments only

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes List

- ✅ API: `GET /arrathons/:id` — détail arrathon (membres seulement)
- ✅ API: `POST /arrathons/join/:token` — rejoindre via inviteToken, idempotent
- ✅ Mobile: `joinArrathon` + `getArrathon` dans `arrathon.api.ts`
- ✅ Mobile: bouton "Inviter des participants" sur cards organisator → `Share.share()`
- ✅ Mobile: `app/join/[token].tsx` — deep link handler (join si connecté, pending token si non)
- ✅ Mobile: `callback.tsx` — auto-join après login si `pending_join_token` en SecureStore

### File List
- `apps/api/src/infrastructure/http/routes/arrathon.routes.ts` (modified)
- `apps/api/src/application/arrathons/arrathon.service.ts` (modified)
- `apps/mobile/src/api/arrathon.api.ts` (modified)
- `apps/mobile/app/(app)/index.tsx` (modified)
- `apps/mobile/app/join/[token].tsx` (new)
- `apps/mobile/app/(auth)/callback.tsx` (modified)
