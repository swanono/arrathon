# Story 3.3: Arrathon Home Screen & Participant List

Status: done

## Story

As a participant or organiser,
I want to see the arrathon details and the list of participants with their roles,
So that I know who is part of the event and in what capacity.

## Acceptance Criteria

1. Given I am a member and open the arrathon dashboard, I see the name, date, and list of participants with name, avatar, and role
2. Given I am on the home screen, tapping an arrathon card opens the dashboard

## Tasks / Subtasks

- [x] Task 1: API — participants endpoint (AC: #1)
  - [x] Add `GET /arrathons/:id/participants` — join user_arrathon + users, return name/avatar/role

- [x] Task 2: Mobile — API function (AC: #1)
  - [x] Add `getParticipants(id)` to `arrathon.api.ts`

- [x] Task 3: Mobile — arrathon detail screen (AC: #1, #2)
  - [x] Create `app/arrathon/[id].tsx` at root level (no tab bar, uses root Stack)
  - [x] Show name, date, participant FlatList with avatar/initials + role badge

- [x] Task 4: Mobile — navigate from home cards (AC: #2)
  - [x] Update `index.tsx` cards: `router.push('/arrathon/${id}')` on press

## Dev Notes

### Route placement
`app/arrathon/[id].tsx` at root level (not inside `(app)/`) so it uses the root Stack navigator — no tab bar shown on this screen.

### API query
Join `user_arrathon` + `users` filtered by arrathon_id, membership check via existing `getArrathon`.

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes List

- ✅ API: `GET /arrathons/:id/participants` — membership check + join users
- ✅ Mobile: `getParticipants(id)` dans `arrathon.api.ts`
- ✅ Mobile: `app/arrathon/[id].tsx` — screen root Stack (pas de tab bar), nom + date + FlatList participants
- ✅ Mobile: cards home → `router.push('/arrathon/${id}')`

### File List
- `apps/api/src/application/arrathons/arrathon.service.ts` (modified)
- `apps/api/src/infrastructure/http/routes/arrathon.routes.ts` (modified)
- `apps/mobile/src/api/arrathon.api.ts` (modified)
- `apps/mobile/app/arrathon/[id].tsx` (new)
- `apps/mobile/app/(app)/index.tsx` (modified)
