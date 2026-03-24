import { Hono } from 'hono'
import { searchPlaces, getPlaceDetails } from '../../../application/places/places.service'
import { DomainError } from '../../../domain/errors/domain-error'

export const placesRoutes = new Hono()

placesRoutes.get('/search', async (c) => {
  const q = c.req.query('q')
  const sessionToken = c.req.query('sessionToken')
  if (!q || !sessionToken) throw new DomainError('VALIDATION_ERROR', 400, 'q and sessionToken required')
  const suggestions = await searchPlaces(q, sessionToken)
  return c.json({ data: suggestions })
})

placesRoutes.get('/details/:placeId', async (c) => {
  const sessionToken = c.req.query('sessionToken')
  if (!sessionToken) throw new DomainError('VALIDATION_ERROR', 400, 'sessionToken required')
  const details = await getPlaceDetails(c.req.param('placeId'), sessionToken)
  return c.json({ data: details })
})
