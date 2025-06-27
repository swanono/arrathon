// import { FastifyPluginAsync } from 'fastify'
// import { Type, Static } from '@sinclair/typebox'


// DELETE /api/arrathons/:id - Supprimer un arrathon
// fastify.delete<{ Params: { id: string } }>('/api/arrathons/:id', async (request, reply) => {
//   try {
//     const arrathonId = parseInt(request.params.id)
//     const userId = request.user?.userId

//     if (isNaN(arrathonId)) {
//       return reply.status(400).send({
//         error: 'ID d\'arrathon invalide',
//         code: 'INVALID_ID'
//       })
import { FastifyPluginAsync } from 'fastify'
import { query, queryRows, queryOne, insert, transaction, exists, deleteFrom } from '../../../db/db.js'
import { authHook } from '../../../plugins/jwt.js'
import { getArrathonWithDetails } from '../../../services/arrathons.js'
import { CreateArrathonSchema, CreateArrathonType } from '../../../schemas/arrathons.js'


const arrathonRoutes: FastifyPluginAsync = async (fastify) => {

  fastify.get('/arrathons', {
    preHandler: [authHook]
  }, async (request, reply) => {
    try {
      const arrathons = await queryRows(`
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
        data: arrathons
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        error: 'Erreur lors de la récupération des arrathons',
        code: 'FETCH_ERROR'
      })
    }
  })

  fastify.get<{ Params: { id: string } }>('/arrathons/:id', {
    preHandler: [authHook],
  }, async (request, reply) => {
    try {
      const arrathonId = parseInt(request.params.id)

      if (isNaN(arrathonId)) {
        return reply.status(400).send({
          error: 'ID d\'arrathon invalide',
          code: 'INVALID_ID'
        })
      }

      const arrathon = await getArrathonWithDetails(arrathonId)
      if (!arrathon) {
        return reply.status(404).send({
          error: 'Arrathon not found',
          code: 'NOT_FOUND'
        })
      }


      return reply.send({
        success: true,
        data: arrathon
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        error: 'Erreur while fetching data for the Arrathon',
        code: 'FETCH_ERROR'
      })
    }
  })

  fastify.post<{ Body: CreateArrathonType }>('/arrathons', {
    preHandler: [authHook],
    schema: {
      body: CreateArrathonSchema
    }
  }, async (request, reply) => {
    try {
      const { name, date, start_time, metadata = {} } = request.body
      const userId = request.user.id

      const arrathonId = await transaction(async (client) => {
        const arrathonId = await insert('arrathons', {
          name,
          date,
          start_time,
          metadata: JSON.stringify(metadata)
        }, client)

        await insert('user_arrathon', {
          user_id: userId,
          arrathon_id: arrathonId,
          role: 'organisator'
        }, client)

        return arrathonId
      })

      return reply.status(201).send({
        success: true,
        message: 'Arrathon created with success',
        data: arrathonId
      })

    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        error: 'Error while creating Arrathon',
        code: 'CREATE_ERROR'
      })
    }
  })

  // POST /arrathons/:id/locations - Ajouter une location à un arrathon
  fastify.post<{
    Params: { id: string },
    Body: AddLocationToArrathonType
  }>('/arrathons/:id/locations', {
    schema: {
      body: AddLocationToArrathonSchema
    }
  }, async (request, reply) => {
    try {
      const arrathonId = parseInt(request.params.id)
      const { location_id, order_position, duration, type } = request.body
      const userId = request.user?.userId

      if (isNaN(arrathonId)) {
        return reply.status(400).send({
          error: 'ID d\'arrathon invalide',
          code: 'INVALID_ID'
        })
      }

      // Vérifier que l'utilisateur est organisateur de cet arrathon
      const isOrganizer = await exists('user_arrathon', {
        user_id: userId,
        arrathon_id: arrathonId,
        role: 'organisator'
      })

      if (!isOrganizer) {
        return reply.status(403).send({
          error: 'Seuls les organisateurs peuvent modifier l\'arrathon',
          code: 'FORBIDDEN'
        })
      }

      // Vérifier que la location existe
      const locationExists = await exists('locations', { id: location_id })

      if (!locationExists) {
        return reply.status(404).send({
          error: 'Location non trouvée',
          code: 'LOCATION_NOT_FOUND'
        })
      }

      // Ajouter la location à l'arrathon
      const newStage = await queryOne(`
      INSERT INTO arrathon_location (arrathon_id, location_id, order_position, duration, type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [arrathonId, location_id, order_position, duration, type])

      return reply.status(201).send({
        success: true,
        message: 'Location ajoutée à l\'arrathon',
        data: newStage
      })

    } catch (error) {
      fastify.log.error(error)

      // Gestion des erreurs de contraintes
      if (error.code === '23505') { // Unique violation
        if (error.constraint?.includes('order_position')) {
          return reply.status(400).send({
            error: 'Cette position dans l\'ordre est déjà occupée',
            code: 'ORDER_CONFLICT'
          })
        }
        if (error.constraint?.includes('location_id')) {
          return reply.status(400).send({
            error: 'Cette location est déjà dans l\'arrathon',
            code: 'LOCATION_DUPLICATE'
          })
        }
      }

      return reply.status(500).send({
        error: 'Erreur lors de l\'ajout de la location',
        code: 'ADD_LOCATION_ERROR'
      })
    }
  })

  // POST /arrathons/:id/participants - Ajouter un participant à un arrathon
  fastify.post<{
    Params: { id: string },
    Body: AddParticipantType
  }>('/arrathons/:id/participants', {
    schema: {
      body: AddParticipantSchema
    }
  }, async (request, reply) => {
    try {
      const arrathonId = parseInt(request.params.id)
      const { user_id, role } = request.body
      const currentUserId = request.user?.userId

      if (isNaN(arrathonId)) {
        return reply.status(400).send({
          error: 'ID d\'arrathon invalide',
          code: 'INVALID_ID'
        })
      }

      // Vérifier que l'utilisateur actuel est organisateur (sauf s'il s'ajoute lui-même comme participant)
      if (role === 'organisator' || user_id !== currentUserId) {
        const isOrganizer = await exists('user_arrathon', {
          user_id: currentUserId,
          arrathon_id: arrathonId,
          role: 'organisator'
        })

        if (!isOrganizer) {
          return reply.status(403).send({
            error: 'Seuls les organisateurs peuvent ajouter des participants',
            code: 'FORBIDDEN'
          })
        }
      }

      // Vérifier que l'utilisateur à ajouter existe
      const userData = await queryOne(`
      SELECT name, family_name, email FROM users WHERE id = $1
    `, [user_id])

      if (!userData) {
        return reply.status(404).send({
          error: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        })
      }

      // Ajouter le participant
      const participant = await queryOne(`
      INSERT INTO user_arrathon (user_id, arrathon_id, role)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [user_id, arrathonId, role])

      return reply.status(201).send({
        success: true,
        message: 'Participant ajouté à l\'arrathon',
        data: {
          ...participant,
          user: userData
        }
      })

    } catch (error) {
      fastify.log.error(error)

      // Gestion de l'erreur de duplicata
      if (error.code === '23505') {
        return reply.status(400).send({
          error: 'Cet utilisateur participe déjà à l\'arrathon',
          code: 'ALREADY_PARTICIPANT'
        })
      }

      return reply.status(500).send({
        error: 'Erreur lors de l\'ajout du participant',
        code: 'ADD_PARTICIPANT_ERROR'
      })
    }
  })

  // DELETE /arrathons/:id/participants/:userId - Supprimer un participant
  fastify.delete<{
    Params: { id: string, userId: string }
  }>('/arrathons/:id/participants/:userId', async (request, reply) => {
    try {
      const arrathonId = parseInt(request.params.id)
      const userIdToRemove = parseInt(request.params.userId)
      const currentUserId = request.user?.userId

      if (isNaN(arrathonId) || isNaN(userIdToRemove)) {
        return reply.status(400).send({
          error: 'IDs invalides',
          code: 'INVALID_ID'
        })
      }

      // Vérifier les permissions (organisateur ou l'utilisateur se retire lui-même)
      if (userIdToRemove !== currentUserId) {
        const isOrganizer = await exists('user_arrathon', {
          user_id: currentUserId,
          arrathon_id: arrathonId,
          role: 'organisator'
        })

        if (!isOrganizer) {
          return reply.status(403).send({
            error: 'Permission refusée',
            code: 'FORBIDDEN'
          })
        }
      }

      // Supprimer le participant
      const deletedCount = await deleteFrom('user_arrathon', {
        user_id: userIdToRemove,
        arrathon_id: arrathonId
      })

      if (deletedCount === 0) {
        return reply.status(404).send({
          error: 'Participant non trouvé dans cet arrathon',
          code: 'NOT_FOUND'
        })
      }

      return reply.send({
        success: true,
        message: 'Participant retiré de l\'arrathon'
      })

    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        error: 'Erreur lors de la suppression du participant',
        code: 'REMOVE_PARTICIPANT_ERROR'
      })
    }
  })

  // DELETE /arrathons/:id - Supprimer un arrathon
  fastify.delete<{ Params: { id: string } }>('/arrathons/:id', async (request, reply) => {
    try {
      const arrathonId = parseInt(request.params.id)
      const userId = request.user?.userId

      if (isNaN(arrathonId)) {
        return reply.status(400).send({
          error: 'ID d\'arrathon invalide',
          code: 'INVALID_ID'
        })
      }

      // Vérifier que l'utilisateur est organisateur
      const orgaCheck = await fastify.pg.query(`
      SELECT 1 FROM user_arrathon 
      WHERE user_id = $1 AND arrathon_id = $2 AND role = 'organisator'
    `, [userId, arrathonId])

      if (orgaCheck.rows.length === 0) {
        return reply.status(403).send({
          error: 'Seuls les organisateurs peuvent supprimer l\'arrathon',
          code: 'FORBIDDEN'
        })
      }

      // Supprimer l'arrathon (cascade supprimera les relations)
      const result = await fastify.pg.query(`
      DELETE FROM arrathons WHERE id = $1 RETURNING *
    `, [arrathonId])

      if (result.rows.length === 0) {
        return reply.status(404).send({
          error: 'Arrathon non trouvé',
          code: 'NOT_FOUND'
        })
      }

      return reply.send({
        success: true,
        message: 'Arrathon supprimé avec succès'
      })

    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        error: 'Erreur lors de la suppression de l\'arrathon',
        code: 'DELETE_ERROR'
      })
    }
  })
}

export default arrathonRoutes;