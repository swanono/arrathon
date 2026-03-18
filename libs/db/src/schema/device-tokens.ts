import { pgTable, uuid, text, varchar, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const deviceTokens = pgTable('device_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expoPushToken: text('expo_push_token').notNull(),
  platform: varchar('platform', { length: 10 }).notNull(), // 'ios' | 'android'
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type DeviceToken = typeof deviceTokens.$inferSelect
export type NewDeviceToken = typeof deviceTokens.$inferInsert
