import { pgTable, uuid, boolean, timestamp, primaryKey, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.ts';
import { arrathons } from './arrathons.ts';
import { locations } from './locations.ts';

export const participantRoleEnum = pgEnum('participant_role', ['participant', 'organisator']);

export const participantStatusEnum = pgEnum('participant_status', [
  'active',
  'abandoned',
  'returned',
  'partial',
]);

export const userArrathon = pgTable(
  'user_arrathon',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    arrathonId: uuid('arrathon_id')
      .notNull()
      .references(() => arrathons.id, { onDelete: 'cascade' }),
    role: participantRoleEnum('role').notNull(),
    status: participantStatusEnum('status').default('active').notNull(),
    packPaid: boolean('pack_paid').default(false).notNull(),
    startingLocationId: uuid('starting_location_id').references(() => locations.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.arrathonId] })],
);

export type UserArrathon = typeof userArrathon.$inferSelect;
export type NewUserArrathon = typeof userArrathon.$inferInsert;
