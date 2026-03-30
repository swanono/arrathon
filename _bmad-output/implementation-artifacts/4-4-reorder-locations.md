# Story 4.4: Reorder Locations

Status: done

## Story

As an organiser,
I want to drag and drop locations to reorder the itinerary,
So that I can adjust the route order before or during the event.

## Acceptance Criteria

1. Given I am an organiser with 2+ locations, I see a "☰ Ordre" button in the locations section header
2. Given I tap "☰ Ordre", I navigate to a dedicated reorder screen
3. Given I drag a location using the ☰ handle, it reorders in place
4. Given I tap "Enregistrer", `PATCH /arrathons/:id/locations/reorder` saves the new order_position values
5. Given I tap "Annuler", I return to the dashboard without saving
6. Given I am a participant, no reorder button is shown

## Tasks / Subtasks

- [x] Task 1: API — reorderLocations
  - [x] Add `reorderLocations(arrathonId, userId, order)` to `location.service.ts` — organiser check, validate ids, batch update orderPosition
  - [x] Add `PATCH /arrathons/:id/locations/reorder` route (before `/:locationId` routes)

- [x] Task 2: Mobile — API client
  - [x] Add `reorderLocations(arrathonId, order)` to `arrathon.api.ts`

- [x] Task 3: Mobile — reorder screen + dashboard button
  - [x] Install `react-native-draggable-flatlist` + add `react-native-reanimated/plugin` to babel.config.js
  - [x] Create `app/arrathon/[id]/reorder-locations.tsx` with `DraggableFlatList`, drag handle (☰), Enregistrer/Annuler
  - [x] Add "☰ Ordre" button in dashboard (organiser only, locations.length > 1) → navigates to reorder screen

## Dev Notes

- Route order matters: `PATCH /reorder` declared before `PATCH /:locationId` to avoid Hono matching "reorder" as a locationId
- `react-native-reanimated` and `react-native-gesture-handler` were already present in monorepo node_modules (transitive deps of expo-router)
- Drag triggered via `onPressIn={drag}` on the handle (not long press) for better UX

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### File List
- `apps/api/src/application/locations/location.service.ts`
- `apps/api/src/infrastructure/http/routes/arrathon.routes.ts`
- `apps/mobile/src/api/arrathon.api.ts`
- `apps/mobile/app/arrathon/[id]/index.tsx`
- `apps/mobile/app/arrathon/[id]/reorder-locations.tsx`
- `apps/mobile/babel.config.js`
