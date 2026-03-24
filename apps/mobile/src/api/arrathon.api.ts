import { apiFetch } from './client'

export type ArrathonSummary = {
  id: string
  name: string
  date: string
  role: 'organisator' | 'participant'
  createdAt: string
}

export async function getMyArrathons(): Promise<ArrathonSummary[]> {
  const res = await apiFetch('/arrathons')
  if (!res.ok) throw new Error('Failed to fetch arrathons')
  const json = await res.json() as { data: ArrathonSummary[] }
  return json.data
}

export async function createArrathon(input: { name: string; date: string }): Promise<ArrathonSummary> {
  const res = await apiFetch('/arrathons', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create arrathon')
  const json = await res.json() as { data: ArrathonSummary }
  return json.data
}

export async function getArrathon(id: string): Promise<ArrathonSummary & { inviteToken: string }> {
  const res = await apiFetch(`/arrathons/${id}`)
  if (!res.ok) throw new Error('Failed to fetch arrathon')
  const json = await res.json() as { data: ArrathonSummary & { inviteToken: string } }
  return json.data
}

export async function joinArrathon(token: string): Promise<{ alreadyMember: boolean; arrathon: { name: string } }> {
  const res = await apiFetch(`/arrathons/join/${token}`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to join arrathon')
  const json = await res.json() as { data: { alreadyMember: boolean; arrathon: { name: string } } }
  return json.data
}

export type LocationType = 'bar' | 'apartment' | 'monument' | 'pit_stand'

export type GoogleData = {
  phone?: string
  openingHours?: string[]
  websiteUri?: string
  rating?: number
  suggestedType?: LocationType
}

export type LocationMetadata = {
  note?: string
  entryCode?: string
  floor?: string
}

export type ArrathonLocation = {
  id: string
  locationId: string
  name: string
  address: string | null
  type: LocationType
  orderPosition: number
  googleData?: GoogleData
  metadata?: LocationMetadata
}

export type PlaceSuggestion = {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
}

export type PlaceDetails = {
  googlePlaceId: string
  name: string
  address: string
  lat: number
  lng: number
  suggestedType: LocationType
  googleData: GoogleData
}

export async function searchPlaces(query: string, sessionToken: string): Promise<PlaceSuggestion[]> {
  const res = await apiFetch(`/places/search?q=${encodeURIComponent(query)}&sessionToken=${sessionToken}`)
  if (!res.ok) return []
  const json = await res.json() as { data: PlaceSuggestion[] }
  return json.data
}

export async function getPlaceDetails(placeId: string, sessionToken: string): Promise<PlaceDetails> {
  const res = await apiFetch(`/places/details/${placeId}?sessionToken=${sessionToken}`)
  if (!res.ok) throw new Error('Failed to get place details')
  const json = await res.json() as { data: PlaceDetails }
  return json.data
}

export async function getLocations(arrathonId: string): Promise<ArrathonLocation[]> {
  const res = await apiFetch(`/arrathons/${arrathonId}/locations`)
  if (!res.ok) throw new Error('Failed to fetch locations')
  const json = await res.json() as { data: ArrathonLocation[] }
  return json.data
}

export async function addLocation(arrathonId: string, input: {
  googlePlaceId: string
  name: string
  address: string
  type: LocationType
  metadata?: LocationMetadata
}): Promise<ArrathonLocation> {
  const res = await apiFetch(`/arrathons/${arrathonId}/locations`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to add location')
  const json = await res.json() as { data: ArrathonLocation }
  return json.data
}

export type Participant = {
  id: string
  name: string
  familyName: string
  avatarUrl: string | null
  role: 'organisator' | 'participant'
}

export async function getParticipants(arrathonId: string): Promise<Participant[]> {
  const res = await apiFetch(`/arrathons/${arrathonId}/participants`)
  if (!res.ok) throw new Error('Failed to fetch participants')
  const json = await res.json() as { data: Participant[] }
  return json.data
}
