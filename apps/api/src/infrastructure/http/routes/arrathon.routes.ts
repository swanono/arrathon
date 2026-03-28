import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth.middleware'
import { createArrathon, getMyArrathons, getArrathon, joinByToken, getParticipants } from '../../../application/arrathons/arrathon.service'
import { addLocation, getLocations, getLocation, updateLocationMetadata, updateLocationDetails, deleteLocation } from '../../../application/locations/location.service'

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

arrathonRoutes.get('/:id', async (c) => {
  const userId = c.get('userId')
  const arrathon = await getArrathon(c.req.param('id'), userId)
  return c.json({ data: arrathon })
})

arrathonRoutes.get('/:id/participants', async (c) => {
  const userId = c.get('userId')
  const participants = await getParticipants(c.req.param('id'), userId)
  return c.json({ data: participants })
})

arrathonRoutes.post('/join/:token', async (c) => {
  const userId = c.get('userId')
  const { arrathon, alreadyMember } = await joinByToken(c.req.param('token'), userId)
  return c.json({ data: { arrathon, alreadyMember } })
})

const locationSchema = z.object({
  googlePlaceId: z.string().min(1),
  name: z.string().min(1),
  address: z.string(),
  type: z.enum(['bar', 'apartment', 'monument', 'pit_stand']),
  metadata: z.object({
    note: z.string().optional(),
    entryCode: z.string().optional(),
    floor: z.string().optional(),
  }).optional(),
})

arrathonRoutes.get('/:id/locations', async (c) => {
  const userId = c.get('userId')
  const list = await getLocations(c.req.param('id'), userId)
  return c.json({ data: list })
})

arrathonRoutes.post('/:id/locations', zValidator('json', locationSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')
  const location = await addLocation(c.req.param('id'), userId, body)
  return c.json({ data: location }, 201)
})

arrathonRoutes.get('/:id/locations/:locationId', async (c) => {
  const userId = c.get('userId')
  const location = await getLocation(c.req.param('id'), c.req.param('locationId'), userId)
  return c.json({ data: location })
})

const metadataSchema = z.object({
  metadata: z.object({
    note: z.string().optional(),
    entryCode: z.string().optional(),
    floor: z.string().optional(),
  }),
})

arrathonRoutes.patch('/:id/locations/:locationId', zValidator('json', metadataSchema), async (c) => {
  const userId = c.get('userId')
  const { metadata } = c.req.valid('json')
  await updateLocationMetadata(c.req.param('id'), c.req.param('locationId'), userId, metadata)
  return c.json({ data: { ok: true } })
})

const locationDetailsSchema = z.object({
  googlePlaceId: z.string().min(1),
  name: z.string().min(1),
  address: z.string(),
  type: z.enum(['bar', 'apartment', 'monument', 'pit_stand']),
})

arrathonRoutes.patch('/:id/locations/:locationId/details', zValidator('json', locationDetailsSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')
  const updated = await updateLocationDetails(c.req.param('id'), c.req.param('locationId'), userId, body)
  return c.json({ data: updated })
})

arrathonRoutes.delete('/:id/locations/:locationId', async (c) => {
  const userId = c.get('userId')
  await deleteLocation(c.req.param('id'), c.req.param('locationId'), userId)
  return c.json({ data: { ok: true } })
})
