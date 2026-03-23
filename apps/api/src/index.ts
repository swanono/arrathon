import './env'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { db, users } from '@arrathon/db'
import { DomainError } from './domain/errors/domain-error'
import { authRoutes } from './infrastructure/http/routes/auth.routes'
import { arrathonRoutes } from './infrastructure/http/routes/arrathon.routes'

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
app.route('/arrathons', arrathonRoutes)

// Public invite redirect — no auth required
app.get('/join/:token', (c) => {
  const token = c.req.param('token')
  const deepLink = `arrathon://join/${token}`
  return c.html(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rejoindre l'arrathon</title>
  <style>
    body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; color: #1a1a2e; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #666; margin-bottom: 2rem; text-align: center; padding: 0 1rem; }
    a { background: #4CAF50; color: white; padding: 0.875rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <h1>🍺 Arrathon</h1>
  <p>Tu as été invité à rejoindre un arrathon.<br>Ouvre l'app pour accepter l'invitation.</p>
  <a href="${deepLink}">Ouvrir l'app</a>
  <script>setTimeout(() => { window.location.href = "${deepLink}" }, 500)</script>
</body>
</html>`)
})

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
