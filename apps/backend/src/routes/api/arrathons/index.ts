import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { getUserById, updateUser } from '../../../services/user.js'

type AuthenticatedRequest = {
  user: {
    userId: number
    name: string
    email: string
  }
} & FastifyRequest;

const arrathons: FastifyPluginAsync = async (fastify) => {

  fastify.get('/api/arrathons', async (request, reply) => {
    try {
      const result = await fastify.pg.query(`
        SELECT 
          a.*,
          json_agg(
            json_build_object(
              'user_id', ua.user_id,
              'role', ua.role,
              'name', u.name,
              'family_name', u.family_name,
              'email', u.email
            )
          ) FILTER (WHERE ua.user_id IS NOT NULL) as participants
        FROM arrathons a
        LEFT JOIN user_arrathon ua ON a.id = ua.arrathon_id
        LEFT JOIN users u ON ua.user_id = u.id
        GROUP BY a.id
        ORDER BY a.date DESC
      `)
      
      return reply.send({
        success: true,
        data: result.rows
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        error: 'Erreur lors de la récupération des arrathons',
        code: 'FETCH_ERROR'
      })
    }
  })

//   // User profile - protected by JWT
//   fastify.get('/user/profile', async function (request, reply) {
//     const user = (request as AuthenticatedRequest).user // from JWT middleware

//     const fullUser = await getUserById(user.userId)

//     if (!fullUser) {
//       return reply.status(404).send({
//         success: false,
//         error: 'User not found'
//       })
//     }

//     return reply.send({
//       success: true,
//       data: {
//         user: {
//           id: fullUser.id,
//           name: fullUser.name,
//           familyName: fullUser.family_name,
//           email: fullUser.email,
//           dateOfBirth: fullUser.date_of_birth,
//           avatarUrl: fullUser.avatar_url,
//           createdAt: fullUser.created_at,
//           updatedAt: fullUser.updated_at
//         macos icon}
//       }
//     })
//   })

  // Create arrathon
  fastify.post('/arrathons/', async function (request, reply) {
    const user = (request as any).user
    const updates = request.body as {
      name?: string
      family_name?: string
      date_of_birth?: string
    }

    try {
      const updatedUser = await updateUser(user.userId, updates)

      return reply.send({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser
        }
      })

    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'An error occurred while updating the profile'
      })
    }
  })

  // Protected test route
  fastify.get('/protected', async function (request, reply) {
    const user = (request as any).user

    return reply.send({
      success: true,
      message: `Hello ${user.name}! This route is protected.`,
      data: {
        userId: user.userId,
        accessTime: new Date().toISOString()
      }
    })
  })
}

export default arrathons
