import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import { FastifyPluginAsync } from 'fastify'
import { User } from '../services/user.js';


declare module 'fastify' {
  interface FastifyInstance {
    createTokens(user: User): Promise<{ accessToken: string; refreshToken?: string }>
  }
}


const jwtPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'my-super-secret-key-min-32-chars',
    sign: {
      expiresIn: '7d'
    }
  })

  fastify.decorate('createTokens', async function(user: User): Promise<{ accessToken: string, refreshToken: string }>  {
    const accessToken = await this.jwt.sign({
      userId: user.id,
      email: user.email,
      name: user.name,
      familyName: user.family_name
    })

    const refreshToken = await this.jwt.sign(
      { userId: user.id, type: 'refresh' },
      { expiresIn: '30d' }
    )

    return { accessToken, refreshToken }
  })

  fastify.addHook('preHandler', async (request, reply) => {
    const protectedPaths = ['/api/user', '/api/protected'] // TODO: move those routes somewhere else ? 
    
    const needsAuth = protectedPaths.some(path => 
      request.url.startsWith(path)
    )
    
    if (needsAuth) {
      try {
        const token = request.headers.authorization?.replace('Bearer ', '')

        if (!token) {
          return reply.status(401).send({ 
            error: 'Token manquant',
            code: 'MISSING_TOKEN' 
          })
        }
        
        const decoded = await request.jwtVerify()
        request.user = decoded
        console.log({token, decoded})
      } catch (err) {
        console.log({err})
        return reply.status(401).send({ 
          error: 'Token invalide ou expiré',
          code: 'INVALID_TOKEN' 
        })
      }
    }
  })
}

export default fp(jwtPlugin)