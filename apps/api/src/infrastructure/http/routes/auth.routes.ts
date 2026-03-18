import { Hono } from 'hono'
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
import { createGoogleAuthUrl, handleGoogleCallback } from '../../../application/auth/google-oauth'
import { refreshAccessToken } from '../../../application/auth/refresh-token'
import { DomainError } from '../../../domain/errors/domain-error'

export const authRoutes = new Hono()

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Lax' as const,
  path: '/',
}

// GET /auth/google — redirect to Google
authRoutes.get('/google', (c) => {
  const { url, state, codeVerifier } = createGoogleAuthUrl()

  setCookie(c, 'google_oauth_state', state, { ...COOKIE_OPTS, maxAge: 600 })
  setCookie(c, 'google_code_verifier', codeVerifier, { ...COOKIE_OPTS, maxAge: 600 })

  return c.redirect(url.toString())
})

// GET /auth/google/callback — handle OAuth callback
authRoutes.get('/google/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')
  const storedState = getCookie(c, 'google_oauth_state')
  const storedCodeVerifier = getCookie(c, 'google_code_verifier')

  if (!code || !state || !storedState || !storedCodeVerifier) {
    throw new DomainError('OAUTH_FAILED', 400, 'Missing OAuth parameters')
  }

  if (state !== storedState) {
    throw new DomainError('OAUTH_STATE_MISMATCH', 400, 'OAuth state mismatch')
  }

  deleteCookie(c, 'google_oauth_state', { path: '/' })
  deleteCookie(c, 'google_code_verifier', { path: '/' })

  const { accessToken, refreshToken, user } = await handleGoogleCallback(code, storedCodeVerifier)

  setCookie(c, 'refresh_token', refreshToken, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 30 })

  return c.json({ data: { accessToken, user } })
})

// POST /auth/refresh — exchange refresh cookie for new access token
authRoutes.post('/refresh', async (c) => {
  const refreshToken = getCookie(c, 'refresh_token')

  if (!refreshToken) {
    throw new DomainError('UNAUTHORIZED', 401, 'Missing refresh token')
  }

  const { accessToken } = await refreshAccessToken(refreshToken)

  return c.json({ data: { accessToken } })
})

// POST /auth/logout — clear refresh token cookie
authRoutes.post('/logout', (c) => {
  deleteCookie(c, 'refresh_token', { path: '/' })
  return c.json({ data: { success: true } })
})
