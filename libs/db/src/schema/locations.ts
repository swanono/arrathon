import { pgTable, uuid, varchar, text, timestamp, customType, jsonb } from 'drizzle-orm/pg-core'

type GoogleData = {
  phone?: string
  openingHours?: string[]
  websiteUri?: string
  rating?: number
  suggestedType?: 'bar' | 'apartment' | 'monument' | 'pit_stand'
}

const geography = customType<{
  data: string
  config: { type?: string; srid?: number }
}>({
  dataType(config) {
    return `geography(${config?.type ?? 'Point'}, ${config?.srid ?? 4326})`
  },
})

export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  coordinates: geography({ type: 'Point', srid: 4326 }),
  googlePlaceId: varchar('google_place_id', { length: 255 }).unique(),
  googleFetchedAt: timestamp('google_fetched_at'),
  googleData: jsonb('google_data').$type<GoogleData>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Location = typeof locations.$inferSelect
export type NewLocation = typeof locations.$inferInsert
