import { pgTable, uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { locations } from './locations'
import { users } from './users'

export const locationUser = pgTable(
  'location_user',
  {
    locationId: uuid('location_id')
      .notNull()
      .references(() => locations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.locationId, table.userId] })],
)

export type LocationUser = typeof locationUser.$inferSelect
export type NewLocationUser = typeof locationUser.$inferInsert
