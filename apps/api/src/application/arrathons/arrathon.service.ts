import { randomUUID } from 'crypto'
import { eq, and } from 'drizzle-orm'
import { db, arrathons, userArrathon, users } from '@arrathon/db'
import { DomainError } from '../../domain/errors/domain-error'

export async function createArrathon(userId: string, input: { name: string; date: string }) {
  const [arrathon] = await db
    .insert(arrathons)
    .values({
      name: input.name,
      date: input.date,
      startTime: '00:00:00',
      inviteToken: randomUUID(),
    })
    .returning()

  await db.insert(userArrathon).values({
    userId,
    arrathonId: arrathon!.id,
    role: 'organisator',
  })

  return arrathon!
}

export async function getArrathon(arrathonId: string, userId: string) {
  const [membership] = await db
    .select()
    .from(userArrathon)
    .where(and(eq(userArrathon.arrathonId, arrathonId), eq(userArrathon.userId, userId)))

  if (!membership) throw new DomainError('FORBIDDEN', 403, 'Not a member')

  const [arrathon] = await db.select().from(arrathons).where(eq(arrathons.id, arrathonId))
  if (!arrathon) throw new DomainError('NOT_FOUND', 404)

  return { ...arrathon, role: membership.role }
}

export async function joinByToken(token: string, userId: string) {
  const [arrathon] = await db.select().from(arrathons).where(eq(arrathons.inviteToken, token))
  if (!arrathon) throw new DomainError('INVITE_INVALID', 404, 'Invalid invite token')

  const [existing] = await db
    .select()
    .from(userArrathon)
    .where(and(eq(userArrathon.arrathonId, arrathon.id), eq(userArrathon.userId, userId)))

  if (!existing) {
    await db.insert(userArrathon).values({ userId, arrathonId: arrathon.id, role: 'participant' })
  }

  return arrathon
}

export async function getParticipants(arrathonId: string, userId: string) {
  const [membership] = await db
    .select()
    .from(userArrathon)
    .where(and(eq(userArrathon.arrathonId, arrathonId), eq(userArrathon.userId, userId)))

  if (!membership) throw new DomainError('FORBIDDEN', 403, 'Not a member')

  return db
    .select({
      id: users.id,
      name: users.name,
      familyName: users.familyName,
      avatarUrl: users.avatarUrl,
      role: userArrathon.role,
    })
    .from(userArrathon)
    .innerJoin(users, eq(userArrathon.userId, users.id))
    .where(eq(userArrathon.arrathonId, arrathonId))
}

export async function getMyArrathons(userId: string) {
  return db
    .select({
      id: arrathons.id,
      name: arrathons.name,
      date: arrathons.date,
      role: userArrathon.role,
      createdAt: arrathons.createdAt,
    })
    .from(userArrathon)
    .innerJoin(arrathons, eq(userArrathon.arrathonId, arrathons.id))
    .where(eq(userArrathon.userId, userId))
    .orderBy(arrathons.date)
}
