import { FastifyPluginAsync } from 'fastify'
import { validateGoogleUserData } from '../../services/auth.js'
import { createUser, findUserByEmail, getUserById } from '../../services/user.js'

const authRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  // 1. Start Google OAuth
  fastify.get('/google', async function (request, reply) {
    return this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
  })

  // 2. OAuth callback - returns JWT in JSON
  fastify.get('/google/callback', async function (request, reply) {
    try {
      const { token } = await this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)

      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${token.access_token}` }
      })

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info from Google')
      }

      const googleUser = validateGoogleUserData(await userResponse.json())

      // Find or create user in DB
      const user = await findUserByEmail(googleUser.email) ?? await createUser({
        name: googleUser.given_name,
        family_name: googleUser.family_name,
        email: googleUser.email,
        google_id: googleUser.id,
        avatar_url: googleUser.picture
      })

      // Create JWT tokens for user
      const { accessToken, refreshToken } = await fastify.createTokens(user)

      return reply.send({
        success: true,
        message: 'Authentication successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            familyName: user.family_name,
            email: user.email,
            avatarUrl: user.avatar_url
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: '7d'
          }
        }
      })

    } catch (error) {
      fastify.log.error('OAuth error:', error)
      return reply.status(500).send({
        success: false,
        error: 'Authentication error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // 3. Refresh token endpoint
  fastify.post('/refresh', async function (request, reply) {
    try {
      const { refreshToken } = request.body as { refreshToken: string }

      if (!refreshToken) {
        return reply.status(400).send({
          success: false,
          error: 'Missing refresh token'
        })
      }

      // Verify refresh token
      const decoded = fastify.jwt.verify(refreshToken) as any

      if (decoded.type !== 'refresh') {
        return reply.status(401).send({
          success: false,
          error: 'Invalid token'
        })
      }

      // Get user from DB
      const user = await getUserById(decoded.userId)
      if (!user) {
        return reply.status(401).send({
          success: false,
          error: 'User not found'
        })
      }

      // Generate new access token
      const { accessToken } = await fastify.createTokens(user)

      return reply.send({
        success: true,
        data: {
          accessToken,
          expiresIn: '7d'
        }
      })

    } catch (error) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid refresh token'
      })
    }
  })

  // 4. Logout (usually handled client-side but for now we will do it here)
  fastify.post('/logout', async function (request, reply) {
    return reply.send({
      success: true,
      message: 'Logout successful'
    })
  })
}

export default authRoutes
