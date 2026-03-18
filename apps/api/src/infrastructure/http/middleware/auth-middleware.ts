import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'
import { DomainError } from '../../../domain/errors/domain-error'

type AuthVariables = {
  userId: string
}

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw new DomainError('UNAUTHORIZED', 401)
  }

  const token = authHeader.slice(7)

  try {
    const payload = await verify(token, process.env.JWT_SECRET!, 'HS256') as { sub?: unknown }
    if (typeof payload.sub !== 'string') {
      throw new DomainError('UNAUTHORIZED', 401)
    }
    c.set('userId', payload.sub)
  } catch (err) {
    if (err instanceof DomainError) throw err
    throw new DomainError('UNAUTHORIZED', 401)
  }

  await next()
})
