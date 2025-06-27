import { Type, Static } from '@sinclair/typebox'

export const CreateArrathonSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  date: Type.String({ format: 'date' }), // YYYY-MM-DD
  start_time: Type.String({ pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$' }), // HH:MM:SS
  metadata: Type.Optional(Type.Object({}, { additionalProperties: true }))
})

export const AddLocationToArrathonSchema = Type.Object({
  location_id: Type.Integer({ minimum: 1 }),
  order_position: Type.Integer({ minimum: 1 }),
  duration: Type.Optional(Type.Integer({ minimum: 1 })), // en minutes
  type: Type.Union([
    Type.Literal('apartment'),
    Type.Literal('bar'),
    Type.Literal('monument'),
    Type.Literal('aid_station'),
    Type.Literal('other')
  ])
})

export const AddParticipantSchema = Type.Object({
  user_id: Type.Integer({ minimum: 1 }),
  role: Type.Union([
    Type.Literal('participant'),
    Type.Literal('organisator')
  ])
})

export type CreateArrathonType = Static<typeof CreateArrathonSchema>
export type AddLocationToArrathonType = Static<typeof AddLocationToArrathonSchema>
export type AddParticipantType = Static<typeof AddParticipantSchema>
