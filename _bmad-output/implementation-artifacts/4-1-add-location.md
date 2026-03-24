# Story 4.1: Add a Location to the Itinerary

Status: in-progress (tasks 1-7 done, tasks 8-11 pending)

## Story

As an organiser,
I want to search for a location by name (e.g. "Les Mésanges") and add it to the itinerary,
So that participants know where the group is heading at each step.

## Acceptance Criteria

1. Given I am an organiser on the arrathon dashboard, I see an "Ajouter un lieu" button
2. Given I tap it and type a name, I see autocomplete suggestions from Google Places
3. Given I select a suggestion, the name, address, coordinates and type are pre-filled
4. Given I confirm, `POST /arrathons/:id/locations` creates the location at the end of the ordered list
5. Given I submit without name or type, an inline error is shown and no request is sent
6. Given I am a participant (not organiser), the "Ajouter un lieu" button is not shown

## Tasks / Subtasks

- [x] Task 1: DB — add Google Places cache columns to locations
  - [ ] Add `google_place_id varchar(255) UNIQUE` to `locations` schema
  - [ ] Add `google_fetched_at timestamp` to `locations` schema
  - [ ] Run `drizzle-kit generate && drizzle-kit migrate`

- [x] Task 2: API — Google Places service (with cache)
  - [ ] Create `apps/api/src/application/places/places.service.ts`
  - [ ] `searchPlaces(query, sessionToken)` — calls Google Places Autocomplete API, returns suggestions list
  - [ ] `getPlaceDetails(placeId, sessionToken)` — checks DB cache first (`google_place_id` + `google_fetched_at < 30 days`), calls Google Places Details API only if cache miss, stores result in `locations` table
  - [ ] Session token passed through from mobile to group autocomplete + detail into 1 billing unit

- [x] Task 3: API — places routes (public search, no arrathon membership needed)
  - [ ] Create `apps/api/src/infrastructure/http/routes/places.routes.ts`
  - [ ] `GET /places/search?q=...&sessionToken=...` — autocomplete suggestions
  - [ ] `GET /places/details/:placeId?sessionToken=...` — place details with cache
  - [ ] Register in `apps/api/src/index.ts` with `authMiddleware`

- [x] Task 4: API — locations service + routes
  - [ ] Create `apps/api/src/application/locations/location.service.ts`
  - [ ] `addLocation(arrathonId, userId, input)` — organiser role check, reuse cached location if `google_place_id` already exists, else insert new, insert `arrathon_location` with next `order_position`
  - [ ] `getLocations(arrathonId, userId)` — membership check, return ordered list
  - [ ] Add to `apps/api/src/infrastructure/http/routes/arrathon.routes.ts`:
    - `POST /arrathons/:id/locations`
    - `GET /arrathons/:id/locations`

- [x] Task 5: Mobile — places + locations API client
  - [ ] Add to `apps/mobile/src/api/arrathon.api.ts`:
    - Types: `Location`, `LocationType`, `PlaceSuggestion`
    - `searchPlaces(query, sessionToken)`
    - `getPlaceDetails(placeId, sessionToken)`
    - `getLocations(arrathonId)`
    - `addLocation(arrathonId, input)`

- [x] Task 6: Mobile — locations list in dashboard
  - [x] Update `app/arrathon/[id]/index.tsx` — show locations section above participants
  - [x] Each location: type icon + name + address
  - [x] "Ajouter un lieu" button visible only for role `organisator`
  - [x] `useFocusEffect` to refresh on return

- [x] Task 7: Mobile — add location screen with Places autocomplete
  - [x] Create `app/arrathon/[id]/add-location.tsx`
  - [x] TextInput with debounce 300ms → calls `searchPlaces`
  - [x] Generate `sessionToken = UUID v4 (Math.random)` at screen mount
  - [x] Suggestions list below input
  - [x] On select: calls `getPlaceDetails` (same sessionToken), pre-fills name + address + type
  - [x] Type selector: bar / apartment / monument / pit_stand
  - [x] Submit → `addLocation` → toast success → `router.back()`

- [ ] Task 8: UX — autocomplete minimum threshold
  - [ ] In `add-location.tsx`: do not call `searchPlaces` if `query.trim().length < 3`
  - [ ] Clear suggestions if query drops below threshold

- [ ] Task 9: DB — extended metadata columns
  - [ ] Add `google_data jsonb` to `locations` schema — stores: `phone`, `openingHours`, `websiteUri`, `rating` fetched from Google
  - [ ] Add `metadata jsonb` to `arrathon_location` schema — stores organiser-entered data: `note`, `entryCode`, `floor` (apartment), free-form per type
  - [ ] Run `drizzle-kit generate && drizzle-kit migrate`

- [ ] Task 10: API — fetch and store extended Google data
  - [ ] Expand `FieldMask` in `getPlaceDetails` to include `regularOpeningHours,nationalPhoneNumber,websiteUri,rating`
  - [ ] Map and store into `locations.google_data` jsonb on insert/upsert
  - [ ] Return `googleData` in `PlaceDetails` response type
  - [ ] Update `addLocation` input type to accept optional `metadata` jsonb
  - [ ] Store `metadata` on `arrathon_location` insert

- [ ] Task 11: Mobile — metadata fields in add-location screen
  - [ ] After type selection, show context-specific metadata fields:
    - `bar` / `pit_stand`: pre-fill opening hours + phone from Google if available (read-only display), `note` free text
    - `apartment`: `entryCode` text input, `floor` text input, `note` free text
    - `monument`: `note` free text
  - [ ] Pass `metadata` to `addLocation` API call
  - [ ] Update `addLocation` type in `arrathon.api.ts`

## Dev Notes

### Google Places caching strategy

**Session tokens** — most impactful optimization:
- Generate 1 UUID per search session (screen mount)
- Pass to every Autocomplete call + the final Details call
- Google groups them into 1 billing unit instead of N+1 calls
- Token must NOT be reused after a Details call — generate new one for next search

**DB cache for place details:**
- `locations.google_place_id` — unique Google place identifier
- `locations.google_fetched_at` — last time we fetched from Google API
- On `getPlaceDetails`: query `SELECT * FROM locations WHERE google_place_id = $1`
  - If found AND `google_fetched_at > NOW() - INTERVAL '30 days'` → return DB data, no API call
  - Else → call Google API, upsert into `locations`, return fresh data
- Same location used in multiple arrathons = fetched from Google only once per 30 days

**Autocomplete caching:**
- Debounce 300ms on mobile (reduce calls while typing)
- Minimum 3 characters before triggering autocomplete (avoids calls on "L", "Le"...)
- No server-side cache for autocomplete (results are query + location specific)

### Google Places API calls used
- `POST https://places.googleapis.com/v1/places:autocomplete` (new Places API v1)
- `GET https://places.googleapis.com/v1/places/:placeId` (new Places API v1)
- Fields requested for details: `id,displayName,formattedAddress,location,types,regularOpeningHours,nationalPhoneNumber,websiteUri,rating`

### Metadata schema (jsonb)

`locations.google_data`:
```json
{ "phone": "+33...", "openingHours": ["Lundi: 9h–18h", ...], "websiteUri": "...", "rating": 4.2 }
```

`arrathon_location.metadata`:
```json
{ "note": "sonner 3 fois", "entryCode": "A1234", "floor": "3ème" }
```

### Location types mapping
Google Places types → arrathon `location_type` enum:
```
bar, night_club, restaurant → 'bar'
premise, apartment          → 'apartment'
tourist_attraction, museum  → 'monument'
(default)                   → 'bar'
```
User can always override the pre-filled type.

### order_position
`SELECT COALESCE(MAX(order_position), 0) + 1 FROM arrathon_location WHERE arrathon_id = $1`

### Coding standards
Single quotes, no extensions in imports, no French comments, `makeStyles(theme)` + `useTheme()`

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes List

### File List
