import { pgTable, uuid, varchar, text, timestamp, customType } from 'drizzle-orm/pg-core'

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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Location = typeof locations.$inferSelect
export type NewLocation = typeof locations.$inferInsert
