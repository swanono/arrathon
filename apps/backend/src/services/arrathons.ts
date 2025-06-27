import { queryOne, queryRows } from '../db/db.js'

export async function getArrathon(id: number) {
  try {
    return await queryOne(`
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
      WHERE a.id = $1
      GROUP BY a.id
    `, [id])
  } catch (err) {
    console.error('Error while getting Arrathon:', err)
    throw new Error('DB_GET_ARRATHON_FAILED')
  }
}

export async function getStagesForArrathon(arrathonId: number) {
  try {
    return await queryRows(`
      SELECT 
        al.*,
        l.name as location_name,
        l.address,
        l.metadata as location_metadata
      FROM arrathon_location al
      JOIN locations l ON al.location_id = l.id
      WHERE al.arrathon_id = $1
      ORDER BY al.order_position
    `, [arrathonId])
  } catch (err) {
    console.error('Error while getting stages for Arrathon:', err)
    throw new Error('DB_GET_STAGES_FAILED')
  }
}

export async function getArrathonWithDetails(id: number) {
  try {
    const arrathon = await getArrathon(id)
    if (!arrathon) return null

    const stages = await getStagesForArrathon(id)
    return { ...arrathon, stages }
  } catch (err) {
    console.error('Erreur while getting Arrathon with Details:', err)
    throw new Error('GET_ARRATHON_DETAILS_FAILED')
  }
}
