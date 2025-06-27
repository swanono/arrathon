import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import { User } from '../services/user.js';


declare module 'fastify' {
  interface FastifyInstance {
    createTokens(user: User): Promise<{ accessToken: string; refreshToken?: string }>
  }
  interface FastifyRequest {
    user: User
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: User
    user: User
  }
}

const isValidUser = (payload: any): payload is User => {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof payload.id === 'number' &&
    typeof payload.name === 'string' &&
    typeof payload.family_name === 'string' &&
    typeof payload.email === 'string'
  )
}


export const authHook = async (request: FastifyRequest, reply: FastifyReply) => {
  const token = request.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return reply.status(401).send({ error: 'Token manquant', code: 'MISSING_TOKEN' })
  }

  try {
    const decoded = await request.jwtVerify()

    if (!isValidUser(decoded)) {
      return reply.status(401).send({ 
        error: 'Invalid payload', 
        code: 'INVALID_PAYLOAD' 
      })
    }
    
    request.user = decoded
  } catch {
    return reply.status(401).send({ error: 'Token invalide', code: 'INVALID_TOKEN' })
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