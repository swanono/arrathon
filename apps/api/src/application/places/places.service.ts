import { eq, sql } from 'drizzle-orm'
import { db, locations } from '@arrathon/db'

const PLACES_API_BASE = 'https://places.googleapis.com/v1'
const CACHE_TTL_DAYS = 30

type PlaceSuggestion = {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
}

type GoogleData = {
  phone?: string
  openingHours?: string[]
  websiteUri?: string
  rating?: number
  suggestedType?: 'bar' | 'apartment' | 'monument' | 'pit_stand'
}

type PlaceDetails = {
  googlePlaceId: string
  name: string
  address: string
  lat: number
  lng: number
  suggestedType: 'bar' | 'apartment' | 'monument' | 'pit_stand'
  googleData: GoogleData
}

function mapGoogleTypesToLocationType(types: string[]): PlaceDetails['suggestedType'] {
  if (types.some((t) => ['bar', 'night_club', 'restaurant', 'food', 'drink'].includes(t))) return 'bar'
  if (types.some((t) => ['premise', 'subpremise', 'apartment'].includes(t))) return 'apartment'
  if (types.some((t) => ['tourist_attraction', 'museum', 'church', 'monument'].includes(t))) return 'monument'
  return 'bar'
}

export async function searchPlaces(query: string, sessionToken: string): Promise<PlaceSuggestion[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY!
  const res = await fetch(`${PLACES_API_BASE}/places:autocomplete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
    },
    body: JSON.stringify({
      input: query,
      sessionToken,
      languageCode: 'fr',
    }),
  })

  if (!res.ok) return []

  const json = await res.json() as {
    suggestions?: Array<{
      placePrediction?: {
        placeId: string
        text: { text: string }
        structuredFormat: {
          mainText: { text: string }
          secondaryText?: { text: string }
        }
      }
    }>
  }

  return (json.suggestions ?? [])
    .filter((s) => s.placePrediction)
    .map((s) => ({
      placeId: s.placePrediction!.placeId,
      description: s.placePrediction!.text.text,
      mainText: s.placePrediction!.structuredFormat.mainText.text,
      secondaryText: s.placePrediction!.structuredFormat.secondaryText?.text ?? '',
    }))
}

export async function getPlaceDetails(placeId: string, sessionToken: string): Promise<PlaceDetails> {
  const cached = await db
    .select()
    .from(locations)
    .where(eq(locations.googlePlaceId, placeId))
    .limit(1)

  if (cached[0]?.googleFetchedAt) {
    const ageMs = Date.now() - cached[0].googleFetchedAt.getTime()
    const ageDays = ageMs / (1000 * 60 * 60 * 24)
    if (ageDays < CACHE_TTL_DAYS) {
      const gd = (cached[0].googleData ?? {}) as GoogleData
      return {
        googlePlaceId: placeId,
        name: cached[0].name,
        address: cached[0].address ?? '',
        lat: 0,
        lng: 0,
        suggestedType: gd.suggestedType ?? 'bar',
        googleData: gd,
      }
    }
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY!
  const res = await fetch(`${PLACES_API_BASE}/places/${placeId}?sessionToken=${sessionToken}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,types,nationalPhoneNumber,regularOpeningHours,websiteUri,rating',
    },
  })

  if (!res.ok) throw new Error('Google Places API error')

  const place = await res.json() as {
    id: string
    displayName: { text: string }
    formattedAddress: string
    location: { latitude: number; longitude: number }
    types: string[]
    nationalPhoneNumber?: string
    regularOpeningHours?: { weekdayDescriptions: string[] }
    websiteUri?: string
    rating?: number
  }

  const suggestedType = mapGoogleTypesToLocationType(place.types)
  const googleData: GoogleData = {
    suggestedType,
    phone: place.nationalPhoneNumber,
    openingHours: place.regularOpeningHours?.weekdayDescriptions,
    websiteUri: place.websiteUri,
    rating: place.rating,
  }

  const now = new Date()
  await db
    .insert(locations)
    .values({
      name: place.displayName.text,
      address: place.formattedAddress,
      googlePlaceId: place.id,
      googleFetchedAt: now,
      googleData,
    })
    .onConflictDoUpdate({
      target: locations.googlePlaceId,
      set: {
        name: place.displayName.text,
        address: place.formattedAddress,
        googleFetchedAt: now,
        googleData,
        updatedAt: sql`now()`,
      },
    })

  return {
    googlePlaceId: place.id,
    name: place.displayName.text,
    address: place.formattedAddress,
    lat: place.location.latitude,
    lng: place.location.longitude,
    suggestedType,
    googleData,
  }
}
