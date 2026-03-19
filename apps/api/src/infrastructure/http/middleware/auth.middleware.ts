import { verify } from 'hono/jwt'
import { DomainError } from '../../../domain/errors/domain-error'
import type { Context, Next } from 'hono'

export async function authMiddleware(c: Context<{ Variables: { userId: string } }>, next: Next) {
  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    throw new DomainError('UNAUTHORIZED', 401, 'Missing token')
  }
  try {
    const payload = await verify(auth.slice(7), process.env.JWT_SECRET!)
    c.set('userId', payload.sub as string)
  } catch {
    throw new DomainError('UNAUTHORIZED', 401, 'Invalid token')
  }
  await next()
}
