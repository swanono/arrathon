# Story 3.1: Create an Arrathon

Status: done

## Story

As an organiser,
I want to create a new arrathon with a name and date,
So that I can set up the event and become its first organiser.

## Acceptance Criteria

1. Given I am authenticated on the home screen, when I tap "Créer un arrathon" and fill in the name and date, then `POST /arrathons` creates the arrathon in DB
2. I am automatically added to `user_arrathon` with role `organisator`
3. The new arrathon appears in my list on the home screen
4. Given I submit with a missing required field, then an inline error is shown and no request is sent

## Tasks / Subtasks

- [x] Task 1: API — JWT auth middleware (AC: all)
  - [x] Create `apps/api/src/infrastructure/http/middleware/auth.middleware.ts`

- [x] Task 2: API — arrathon service (AC: #1, #2)
  - [x] Create `apps/api/src/application/arrathons/arrathon.service.ts` with `createArrathon` + `getMyArrathons`

- [x] Task 3: API — arrathon routes (AC: #1, #2, #3)
  - [x] Create `apps/api/src/infrastructure/http/routes/arrathon.routes.ts` — `POST /` + `GET /`
  - [x] Register `/arrathons` in `apps/api/src/index.ts`

- [x] Task 4: Mobile — arrathon API client (AC: #1, #3)
  - [x] Create `apps/mobile/src/api/arrathon.api.ts`

- [x] Task 5: Mobile — create arrathon form screen (AC: #1, #4)
  - [x] Create `apps/mobile/app/(app)/create-arrathon.tsx`
  - [x] Add as hidden tab screen in `(app)/_layout.tsx`

- [x] Task 6: Mobile — home screen lists arrathons (AC: #3)
  - [x] Update `apps/mobile/app/(app)/index.tsx` with FlatList + "Créer" button

## Dev Notes

### DB schema notes
- `arrathons.startTime` is NOT NULL in schema — default to `'00:00:00'` server-side
- `arrathons.inviteToken` — generate a UUID on creation (needed for Story 3.2)
- `arrathons` has no `description` column — form uses name + date only

### API auth pattern
JWT payload: `{ sub: userId, email, name, familyName, exp }`
Middleware sets `c.set('userId', payload.sub)` — routes typed with `Hono<{ Variables: { userId: string } }>`

### Navigation note
After creation, navigate to `/(app)` (home). Arrathon dashboard screen is Story 3.3.

### Coding standards
- Single quotes, no extensions in imports
- `makeStyles(theme)` + `useTheme()` for all styles
- No comments in French

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes List

- ✅ API: `authMiddleware` — verify Bearer JWT, sets `userId` in Hono context
- ✅ API: `arrathon.service.ts` — `createArrathon` (insert + join as organisator + inviteToken UUID), `getMyArrathons` (join query)
- ✅ API: `POST /arrathons` + `GET /arrathons` — zod validation, auth-protected
- ✅ Mobile: `arrathon.api.ts` — typed `getMyArrathons` + `createArrathon`
- ✅ Mobile: `create-arrathon.tsx` — form name + date, inline validation, 3D button
- ✅ Mobile: `index.tsx` — FlatList avec cards, badge orga/participant, bouton "+ Créer"
- ℹ️ Navigation post-création → `/(app)` (dashboard = Story 3.3)

### File List
- `apps/api/src/infrastructure/http/middleware/auth.middleware.ts` (new)
- `apps/api/src/application/arrathons/arrathon.service.ts` (new)
- `apps/api/src/infrastructure/http/routes/arrathon.routes.ts` (new)
- `apps/api/src/index.ts` (modified)
- `apps/mobile/src/api/arrathon.api.ts` (new)
- `apps/mobile/app/(app)/create-arrathon.tsx` (new)
- `apps/mobile/app/(app)/_layout.tsx` (modified)
- `apps/mobile/app/(app)/index.tsx` (modified)
