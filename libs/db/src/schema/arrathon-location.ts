import { pgTable, uuid, integer, timestamp, pgEnum, unique } from 'drizzle-orm/pg-core';
import { arrathons } from './arrathons.ts';
import { locations } from './locations.ts';

export const locationTypeEnum = pgEnum('location_type', [
  'bar',
  'apartment',
  'monument',
  'pit_stand',
]);

export const arrathonLocation = pgTable(
  'arrathon_location',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    arrathonId: uuid('arrathon_id')
      .notNull()
      .references(() => arrathons.id, { onDelete: 'cascade' }),
    locationId: uuid('location_id')
      .notNull()
      .references(() => locations.id, { onDelete: 'cascade' }),
    orderPosition: integer('order_position').notNull(),
    duration: integer('duration'),
    type: locationTypeEnum('type').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    unique('uq_arrathon_location_order').on(table.arrathonId, table.orderPosition),
    unique('uq_arrathon_location_pair').on(table.arrathonId, table.locationId),
  ],
);

export type ArrathonLocation = typeof arrathonLocation.$inferSelect;
export type NewArrathonLocation = typeof arrathonLocation.$inferInsert;
