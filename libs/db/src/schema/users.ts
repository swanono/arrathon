import { pgTable, uuid, varchar, text, date, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  familyName: varchar('family_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique(),
  googleId: varchar('google_id', { length: 255 }).unique(),
  avatarUrl: text('avatar_url'),
  dateOfBirth: date('date_of_birth'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
