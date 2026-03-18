import { pgTable, uuid, varchar, date, time, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.ts';

export const arrathons = pgTable('arrathons', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  date: date('date').notNull(),
  startTime: time('start_time').notNull(),
  inviteToken: text('invite_token').unique(),
  packPrice: integer('pack_price'),
  packContents: text('pack_contents'),
  packMandatory: boolean('pack_mandatory').default(false).notNull(),
  packCommanderId: uuid('pack_commander_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Arrathon = typeof arrathons.$inferSelect;
export type NewArrathon = typeof arrathons.$inferInsert;
