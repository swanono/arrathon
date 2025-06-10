import fp from 'fastify-plugin'
import oauth2 from '@fastify/oauth2'
import { FastifyPluginAsync } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    googleOAuth2: {
      getAccessTokenFromAuthorizationCodeFlow(request: any): Promise<{ token: { access_token: string } }>
    }
  }
}

const oauthPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(oauth2, {
    name: 'googleOAuth2',
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID!,
        secret: process.env.GOOGLE_CLIENT_SECRET!
      },
      auth: {
        authorizeHost: 'https://accounts.google.com',
        authorizePath: '/o/oauth2/v2/auth',
        tokenHost: 'https://oauth2.googleapis.com',
        tokenPath: '/token'
      }
    },
    startRedirectPath: '/api/auth/google',
    callbackUri: process.env.GOOGLE_CALLBACK_URI || 'http://localhost:3000/api/auth/google/callback',
    scope: ['profile', 'email']
  })
}

export default fp(oauthPlugin)
