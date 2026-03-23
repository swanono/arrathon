import { Google, generateState, generateCodeVerifier, decodeIdToken, OAuth2RequestError } from 'arctic'
import { sign } from 'hono/jwt'
import { db, users } from '@arrathon/db'
import { eq } from 'drizzle-orm'
import { DomainError } from '../../domain/errors/domain-error'

function getGoogleClient(): Google {
  return new Google(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_CALLBACK_URI ?? 'http://localhost:3000/auth/google/callback',
  )
}

export function createGoogleAuthUrl(platform: string = 'web'): { url: URL; encodedState: string; codeVerifier: string } {
  const rawState = generateState()
  const codeVerifier = generateCodeVerifier()
  const encodedState = Buffer.from(JSON.stringify({ s: rawState, p: platform })).toString('base64url')
  const url = getGoogleClient().createAuthorizationURL(encodedState, codeVerifier, ['openid', 'profile', 'email'])
  url.searchParams.set('prompt', 'select_account')
  return { url, encodedState, codeVerifier }
}

export function decodeOAuthState(encodedState: string): { s: string; p: string } {
  return JSON.parse(Buffer.from(encodedState, 'base64url').toString())
}

export async function handleGoogleCallback(
  code: string,
  storedCodeVerifier: string,
): Promise<{ accessToken: string; refreshToken: string; user: { id: string; name: string; familyName: string; email: string; avatarUrl: string | null } }> {
  let tokens
  try {
    tokens = await getGoogleClient().validateAuthorizationCode(code, storedCodeVerifier)
  } catch (err) {
    if (err instanceof OAuth2RequestError) {
      throw new DomainError('OAUTH_FAILED', 400, err.message)
    }
    throw new DomainError('OAUTH_FAILED', 500)
  }

  const idToken = tokens.idToken()
  const claims = decodeIdToken(idToken) as {
    sub: string
    email: string
    given_name: string
    family_name: string
    picture?: string
  }

  const { sub: googleId, email, given_name, family_name, picture } = claims

  let user = await db.query.users.findFirst({ where: eq(users.googleId, googleId) })

  if (!user) {
    const [created] = await db
      .insert(users)
      .values({
        name: given_name,
        familyName: family_name,
        email,
        googleId,
        avatarUrl: picture ?? null,
      })
      .returning()
    user = created!
  }

  const secret = process.env.JWT_SECRET!
  const now = Math.floor(Date.now() / 1000)

  const accessToken = await sign(
    { sub: user.id, email: user.email, name: user.name, familyName: user.familyName, exp: now + 60 * 15 },
    secret,
  )

  const refreshToken = await sign(
    { sub: user.id, type: 'refresh', exp: now + 60 * 60 * 24 * 30 },
    secret,
  )

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      familyName: user.familyName,
      email: user.email ?? '',
      avatarUrl: user.avatarUrl ?? null,
    },
  }
}
