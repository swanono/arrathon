# Story 4.1: Add a Location to the Itinerary

Status: in-progress

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

- [ ] Task 1: DB — add Google Places cache columns to locations
  - [ ] Add `google_place_id varchar(255) UNIQUE` to `locations` schema
  - [ ] Add `google_fetched_at timestamp` to `locations` schema
  - [ ] Run `drizzle-kit generate && drizzle-kit migrate`

- [ ] Task 2: API — Google Places service (with cache)
  - [ ] Create `apps/api/src/application/places/places.service.ts`
  - [ ] `searchPlaces(query, sessionToken)` — calls Google Places Autocomplete API, returns suggestions list
  - [ ] `getPlaceDetails(placeId, sessionToken)` — checks DB cache first (`google_place_id` + `google_fetched_at < 30 days`), calls Google Places Details API only if cache miss, stores result in `locations` table
  - [ ] Session token passed through from mobile to group autocomplete + detail into 1 billing unit

- [ ] Task 3: API — places routes (public search, no arrathon membership needed)
  - [ ] Create `apps/api/src/infrastructure/http/routes/places.routes.ts`
  - [ ] `GET /places/search?q=...&sessionToken=...` — autocomplete suggestions
  - [ ] `GET /places/details/:placeId?sessionToken=...` — place details with cache
  - [ ] Register in `apps/api/src/index.ts` with `authMiddleware`

- [ ] Task 4: API — locations service + routes
  - [ ] Create `apps/api/src/application/locations/location.service.ts`
  - [ ] `addLocation(arrathonId, userId, input)` — organiser role check, reuse cached location if `google_place_id` already exists, else insert new, insert `arrathon_location` with next `order_position`
  - [ ] `getLocations(arrathonId, userId)` — membership check, return ordered list
  - [ ] Add to `apps/api/src/infrastructure/http/routes/arrathon.routes.ts`:
    - `POST /arrathons/:id/locations`
    - `GET /arrathons/:id/locations`

- [ ] Task 5: Mobile — places + locations API client
  - [ ] Add to `apps/mobile/src/api/arrathon.api.ts`:
    - Types: `Location`, `LocationType`, `PlaceSuggestion`
    - `searchPlaces(query, sessionToken)`
    - `getPlaceDetails(placeId, sessionToken)`
    - `getLocations(arrathonId)`
    - `addLocation(arrathonId, input)`

- [ ] Task 6: Mobile — locations list in dashboard
  - [ ] Update `app/arrathon/[id].tsx` — show locations section above participants
  - [ ] Each location: type icon + name + address
  - [ ] "Ajouter un lieu" button visible only for role `organisator`
  - [ ] `useFocusEffect` to refresh on return

- [ ] Task 7: Mobile — add location screen with Places autocomplete
  - [ ] Create `app/arrathon/[id]/add-location.tsx`
  - [ ] TextInput with debounce 300ms → calls `searchPlaces`
  - [ ] Generate `sessionToken = randomUUID()` at screen mount (groups all keystrokes + detail call)
  - [ ] Suggestions list below input
  - [ ] On select: calls `getPlaceDetails` (same sessionToken), pre-fills name + address + type
  - [ ] Type selector: bar / apartment / monument / pit_stand (can override Google's suggestion)
  - [ ] Submit → `addLocation` → toast success → `router.back()`

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
- No server-side cache for autocomplete (results are query + location specific)

### Google Places API calls used
- `POST https://places.googleapis.com/v1/places:autocomplete` (new Places API v1)
- `GET https://places.googleapis.com/v1/places/:placeId` (new Places API v1)
- Fields requested for details: `id,displayName,formattedAddress,location,types`

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
