# Story 4.3: Edit & Delete a Location

Status: done

## Story

As an organiser,
I want to edit or delete a location in the itinerary,
So that I can correct mistakes or remove a location that is no longer relevant.

## Acceptance Criteria

1. Given I am an organiser on the location detail screen, I see "Modifier" and "Supprimer" buttons
2. Given I tap "Modifier", the name, address, and type become editable inline — I can update and save
3. Given I tap "Supprimer" and confirm, the location is deleted and I return to the dashboard
4. Given a location is deleted, the order_position of remaining locations is recalculated (no gaps)
5. Given I am a participant, no edit or delete buttons are shown

## Tasks / Subtasks

- [x] Task 1: API — updateLocationDetails + deleteLocation
  - [x] Add `updateLocationDetails(arrathonId, locationId, userId, { name, address, type })` to `location.service.ts`
  - [x] Add `deleteLocation(arrathonId, locationId, userId)` to `location.service.ts` — organiser check, delete row, shift order_position > deleted by -1
  - [x] Add `PATCH /arrathons/:id/locations/:locationId/details` route — zod: `{ name, address, type }`
  - [x] Add `DELETE /arrathons/:id/locations/:locationId` route

- [x] Task 2: Mobile — API client
  - [x] Add `updateLocationDetails(arrathonId, locationId, input)` to `arrathon.api.ts`
  - [x] Add `deleteLocation(arrathonId, locationId)` to `arrathon.api.ts`

- [x] Task 3: Mobile — edit + delete in location detail screen
  - [x] In `[locationId]/index.tsx`: add edit mode toggle for organiser (name, address, type editable)
  - [x] "Enregistrer les modifications" → `updateLocationDetails` → toast → exit edit mode
  - [x] "Supprimer ce lieu" button (organiser only) → confirmation Alert → `deleteLocation` → toast → `router.replace(`/arrathon/${id}`)`

## Dev Notes

### order_position recalculation after delete
```sql
UPDATE arrathon_location SET order_position = order_position - 1
WHERE arrathon_id = $1 AND order_position > $deletedPosition
```

### Coding standards
Single quotes, no extensions in imports, no French comments, `makeStyles(theme)` + `useTheme()`

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes List

### File List
