import { eq, max, and, gt, sql, inArray } from 'drizzle-orm'
import { db, locations, arrathonLocation, userArrathon } from '@arrathon/db'
import { DomainError } from '../../domain/errors/domain-error'

type LocationType = 'bar' | 'apartment' | 'monument' | 'pit_stand'

type LocationMetadata = {
  note?: string
  entryCode?: string
  floor?: string
}

type AddLocationInput = {
  googlePlaceId: string
  name: string
  address: string
  type: LocationType
  metadata?: LocationMetadata
}

const locationSelect = {
  id: arrathonLocation.id,
  locationId: locations.id,
  name: locations.name,
  address: locations.address,
  type: arrathonLocation.type,
  orderPosition: arrathonLocation.orderPosition,
  metadata: arrathonLocation.metadata,
  googleData: locations.googleData,
}

export async function addLocation(arrathonId: string, userId: string, input: AddLocationInput) {
  const [membership] = await db
    .select()
    .from(userArrathon)
    .where(eq(userArrathon.arrathonId, arrathonId) && eq(userArrathon.userId, userId) as never)

  if (!membership || membership.role !== 'organisator') {
    throw new DomainError('FORBIDDEN', 403, 'Only organisers can add locations')
  }

  const [existing] = await db
    .select({ id: locations.id })
    .from(locations)
    .where(eq(locations.googlePlaceId, input.googlePlaceId))
    .limit(1)

  const locationId = existing?.id ?? (await db
    .insert(locations)
    .values({
      name: input.name,
      address: input.address,
      googlePlaceId: input.googlePlaceId,
      googleFetchedAt: new Date(),
    })
    .returning({ id: locations.id })
    .then(([r]) => r!.id))

  const [maxPos] = await db
    .select({ val: max(arrathonLocation.orderPosition) })
    .from(arrathonLocation)
    .where(eq(arrathonLocation.arrathonId, arrathonId))

  const nextPosition = (maxPos?.val ?? 0) + 1

  const [entry] = await db
    .insert(arrathonLocation)
    .values({
      arrathonId,
      locationId,
      orderPosition: nextPosition,
      type: input.type,
      metadata: input.metadata,
    })
    .returning()

  return { ...entry, name: input.name, address: input.address }
}

export async function getLocations(arrathonId: string, userId: string) {
  const [membership] = await db
    .select()
    .from(userArrathon)
    .where(eq(userArrathon.arrathonId, arrathonId) && eq(userArrathon.userId, userId) as never)

  if (!membership) throw new DomainError('FORBIDDEN', 403, 'Not a member')

  return db
    .select(locationSelect)
    .from(arrathonLocation)
    .innerJoin(locations, eq(arrathonLocation.locationId, locations.id))
    .where(eq(arrathonLocation.arrathonId, arrathonId))
    .orderBy(arrathonLocation.orderPosition)
}

export async function getLocation(arrathonId: string, locationId: string, userId: string) {
  const [membership] = await db
    .select()
    .from(userArrathon)
    .where(and(eq(userArrathon.arrathonId, arrathonId), eq(userArrathon.userId, userId)))

  if (!membership) throw new DomainError('FORBIDDEN', 403, 'Not a member')

  const [result] = await db
    .select(locationSelect)
    .from(arrathonLocation)
    .innerJoin(locations, eq(arrathonLocation.locationId, locations.id))
    .where(and(eq(arrathonLocation.arrathonId, arrathonId), eq(arrathonLocation.id, locationId)))
    .limit(1)

  if (!result) throw new DomainError('NOT_FOUND', 404, 'Location not found')
  return { ...result, userRole: membership.role }
}

export async function updateLocationMetadata(
  arrathonId: string,
  locationId: string,
  userId: string,
  metadata: LocationMetadata,
) {
  const [membership] = await db
    .select()
    .from(userArrathon)
    .where(and(eq(userArrathon.arrathonId, arrathonId), eq(userArrathon.userId, userId)))

  if (!membership || membership.role !== 'organisator') {
    throw new DomainError('FORBIDDEN', 403, 'Only organisers can edit locations')
  }

  const [updated] = await db
    .update(arrathonLocation)
    .set({ metadata })
    .where(and(eq(arrathonLocation.id, locationId), eq(arrathonLocation.arrathonId, arrathonId)))
    .returning()

  if (!updated) throw new DomainError('NOT_FOUND', 404, 'Location not found')
  return updated
}

export async function updateLocationDetails(
  arrathonId: string,
  locationId: string,
  userId: string,
  input: { googlePlaceId: string; name: string; address: string; type: LocationType },
) {
  const [membership] = await db
    .select()
    .from(userArrathon)
    .where(and(eq(userArrathon.arrathonId, arrathonId), eq(userArrathon.userId, userId)))

  if (!membership || membership.role !== 'organisator') {
    throw new DomainError('FORBIDDEN', 403, 'Only organisers can edit locations')
  }

  const [existing] = await db
    .select({ id: locations.id })
    .from(locations)
    .where(eq(locations.googlePlaceId, input.googlePlaceId))
    .limit(1)

  const newLocationId = existing?.id ?? (await db
    .insert(locations)
    .values({
      name: input.name,
      address: input.address,
      googlePlaceId: input.googlePlaceId,
      googleFetchedAt: new Date(),
    })
    .returning({ id: locations.id })
    .then(([r]) => r!.id))

  const [updated] = await db
    .update(arrathonLocation)
    .set({ locationId: newLocationId, type: input.type })
    .where(and(eq(arrathonLocation.id, locationId), eq(arrathonLocation.arrathonId, arrathonId)))
    .returning()

  if (!updated) throw new DomainError('NOT_FOUND', 404, 'Location not found')
  return { ...updated, name: input.name, address: input.address }
}

export async function deleteLocation(arrathonId: string, locationId: string, userId: string) {
  const [membership] = await db
    .select()
    .from(userArrathon)
    .where(and(eq(userArrathon.arrathonId, arrathonId), eq(userArrathon.userId, userId)))

  if (!membership || membership.role !== 'organisator') {
    throw new DomainError('FORBIDDEN', 403, 'Only organisers can delete locations')
  }

  const [entry] = await db
    .select({ orderPosition: arrathonLocation.orderPosition })
    .from(arrathonLocation)
    .where(and(eq(arrathonLocation.id, locationId), eq(arrathonLocation.arrathonId, arrathonId)))
    .limit(1)

  if (!entry) throw new DomainError('NOT_FOUND', 404, 'Location not found')

  await db
    .delete(arrathonLocation)
    .where(eq(arrathonLocation.id, locationId))

  await db
    .update(arrathonLocation)
    .set({ orderPosition: sql`${arrathonLocation.orderPosition} - 1` })
    .where(and(
      eq(arrathonLocation.arrathonId, arrathonId),
      gt(arrathonLocation.orderPosition, entry.orderPosition),
    ))
}

export async function reorderLocations(
  arrathonId: string,
  userId: string,
  order: { id: string; orderPosition: number }[],
) {
  const [membership] = await db
    .select()
    .from(userArrathon)
    .where(and(eq(userArrathon.arrathonId, arrathonId), eq(userArrathon.userId, userId)))

  if (!membership || membership.role !== 'organisator') {
    throw new DomainError('FORBIDDEN', 403, 'Only organisers can reorder locations')
  }

  const ids = order.map((o) => o.id)
  const existing = await db
    .select({ id: arrathonLocation.id })
    .from(arrathonLocation)
    .where(and(eq(arrathonLocation.arrathonId, arrathonId), inArray(arrathonLocation.id, ids)))

  if (existing.length !== ids.length) {
    throw new DomainError('BAD_REQUEST', 400, 'Invalid location ids')
  }

  const caseWhen = sql`CASE ${arrathonLocation.id} ${sql.join(
    order.map(({ id, orderPosition }) => sql`WHEN ${id}::uuid THEN ${orderPosition}`),
    sql` `,
  )} ELSE ${arrathonLocation.orderPosition} END`

  await db
    .update(arrathonLocation)
    .set({ orderPosition: caseWhen })
    .where(and(eq(arrathonLocation.arrathonId, arrathonId), inArray(arrathonLocation.id, ids)))
}
