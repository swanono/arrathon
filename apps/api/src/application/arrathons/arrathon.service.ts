import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { db, arrathons, userArrathon } from '@arrathon/db'

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
