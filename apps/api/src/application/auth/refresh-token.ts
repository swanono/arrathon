import { verify, sign } from 'hono/jwt'
import { db, users } from '@arrathon/db'
import { eq } from 'drizzle-orm'
import { DomainError } from '../../domain/errors/domain-error'

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
  const secret = process.env.JWT_SECRET!

  let payload: { sub?: unknown; type?: unknown }
  try {
    payload = await verify(refreshToken, secret, 'HS256') as { sub?: unknown; type?: unknown }
  } catch {
    throw new DomainError('UNAUTHORIZED', 401, 'Invalid refresh token')
  }

  if (payload.type !== 'refresh' || typeof payload.sub !== 'string') {
    throw new DomainError('UNAUTHORIZED', 401, 'Invalid refresh token type')
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, payload.sub) })
  if (!user) {
    throw new DomainError('UNAUTHORIZED', 401, 'User not found')
  }

  const now = Math.floor(Date.now() / 1000)
  const accessToken = await sign(
    { sub: user.id, email: user.email, name: user.name, familyName: user.familyName, exp: now + 60 * 15 },
    secret,
  )

  return { accessToken }
}
