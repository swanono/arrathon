# Story 4.2: View and Edit Location Detail

Status: todo

## Story

As a participant or organiser,
I want to tap a location in the itinerary and see its full details,
So that I have all the information I need before or during the arrathon (phone, hours, entry code, notes).

## Acceptance Criteria

1. Given I tap a location in the dashboard list, I navigate to the location detail screen
2. Given I am any member, I see: name, address, type icon, Google data (phone, opening hours, website if available)
3. Given I am an organiser, I see editable metadata fields (note, entryCode/floor for apartments)
4. Given I am a participant, metadata is read-only (display only if set)
5. Given I edit and save metadata as organiser, `PATCH /arrathons/:arrathonId/locations/:locationId` is called and a success toast is shown
6. Given no metadata has been set, the metadata section is hidden for participants and shows empty inputs for organisers

## Tasks / Subtasks

- [ ] Task 1: API — PATCH route for location metadata
  - [ ] Add `updateLocationMetadata(arrathonId, locationId, userId, metadata)` to `location.service.ts`
    - Organiser-only check
    - Update `arrathon_location.metadata` jsonb
  - [ ] Add `PATCH /arrathons/:id/locations/:locationId` to `arrathon.routes.ts`
    - zod schema: `{ metadata: z.record(z.unknown()) }`

- [ ] Task 2: API — expose metadata + googleData in GET locations response
  - [ ] Update `getLocations` query to include `arrathon_location.metadata` and `locations.google_data`
  - [ ] Update `getLocation(arrathonId, locationId, userId)` — single location with full data
  - [ ] Add `GET /arrathons/:id/locations/:locationId` route

- [ ] Task 3: Mobile — API client
  - [ ] Add to `arrathon.api.ts`:
    - `GoogleData` type: `{ phone?: string; openingHours?: string[]; websiteUri?: string; rating?: number }`
    - `LocationMetadata` type: `{ note?: string; entryCode?: string; floor?: string }`
    - Update `ArrathonLocation` type to include `googleData` and `metadata`
    - `getLocation(arrathonId, locationId)` — single location
    - `updateLocationMetadata(arrathonId, locationId, metadata)` — PATCH

- [ ] Task 4: Mobile — location detail screen
  - [ ] Create `app/arrathon/[id]/location/[locationId].tsx`
  - [ ] Back button → `router.back()`
  - [ ] Header: type icon + name + address
  - [ ] Google data section (if any field available): phone (pressable → `Linking.openURL`), opening hours list, website (pressable)
  - [ ] Metadata section:
    - Organiser: editable fields per type (TextInput), "Enregistrer" button → `updateLocationMetadata` → toast
    - Participant: read-only display of set fields, hidden if empty

- [ ] Task 5: Mobile — wire tap from dashboard
  - [ ] In `app/arrathon/[id]/index.tsx`: make location rows `Pressable` → `router.push(`/arrathon/${id}/location/${loc.id}`)`

## Dev Notes

### Metadata fields per type

| Type | Editable fields |
|------|----------------|
| `bar` | `note` |
| `pit_stand` | `note` |
| `apartment` | `entryCode`, `floor`, `note` |
| `monument` | `note` |

### Google data display
- Opening hours: array of strings (e.g. `["Lundi: 9h–18h", "Mardi: 9h–18h", ...]`)
- Phone: `nationalPhoneNumber` from Google, tappable with `Linking.openURL('tel:...')`
- Website: tappable with `Linking.openURL`
- Only show sections that have data (no empty "Horaires: —")

### Coding standards
Single quotes, no extensions in imports, no French comments, `makeStyles(theme)` + `useTheme()`

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes List

### File List
