import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth.middleware'
import { createArrathon, getMyArrathons } from '../../../application/arrathons/arrathon.service'

type Variables = { userId: string }

export const arrathonRoutes = new Hono<{ Variables: Variables }>()

arrathonRoutes.use('*', authMiddleware)

const createSchema = z.object({
  name: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

arrathonRoutes.post('/', zValidator('json', createSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')
  const arrathon = await createArrathon(userId, body)
  return c.json({ data: arrathon }, 201)
})

arrathonRoutes.get('/', async (c) => {
  const userId = c.get('userId')
  const list = await getMyArrathons(userId)
  return c.json({ data: list })
})
