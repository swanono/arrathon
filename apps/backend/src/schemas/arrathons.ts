import { z } from 'zod'

export const CreateArrathonSchema = z.object({
  name: z.string().min(1).max(255),
  date: z.string().date(), // YYYY-MM-DD
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/), // HH:MM:SS
  metadata: z.record(z.any()).optional()
})

export const AddLocationToArrathonSchema = z.object({
  location_id: z.number().int().min(1),
  order_position: z.number().int().min(1),
  duration: z.number().int().min(1).optional(), // en minutes
  type: z.enum(['apartment', 'bar', 'monument', 'aid_station', 'other'])
})

export const AddParticipantSchema = z.object({
  user_id: z.number().int().min(1),
  role: z.enum(['participant', 'organisator'])
})

export type CreateArrathonType = z.infer<typeof CreateArrathonSchema>
export type AddLocationToArrathonType = z.infer<typeof AddLocationToArrathonSchema>
export type AddParticipantType = z.infer<typeof AddParticipantSchema>