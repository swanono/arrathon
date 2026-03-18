import './env'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { db, users } from '@arrathon/db'
import { DomainError } from './domain/errors/domain-error'
import { authRoutes } from './infrastructure/http/routes/auth.routes'

const app = new Hono()

// CORS — allow Expo Metro dev port + local
app.use(
  '*',
  cors({
    origin: ['http://localhost:8081', 'http://localhost:3000'],
    credentials: true,
  }),
)

// Routes
app.route('/auth', authRoutes)

// Health check with DB ping
app.get('/health', async (c) => {
  await db.select().from(users).limit(1)
  return c.json({ data: { status: 'ok' } })
})

// Global error handler
app.onError((err, c) => {
  if (err instanceof DomainError) {
    return c.json(
      { error: { code: err.code, message: err.message } },
      err.statusCode as 400 | 401 | 403 | 404 | 409 | 422 | 500,
    )
  }
  console.error(err)
  return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, 500)
})

const port = Number(process.env.PORT ?? 3000)

serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`)
})

export default app
