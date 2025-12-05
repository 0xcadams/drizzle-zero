import {boolean, pgTable, primaryKey, text} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export const friendship = pgTable(
  'friendship',
  {
    requestingId: text('requesting_id')
      .notNull()
      .references(() => user.id),
    acceptingId: text('accepting_id')
      .notNull()
      .references(() => user.id),
    accepted: boolean('accepted').notNull(),
  },
  t => [primaryKey({columns: [t.requestingId, t.acceptingId]})],
);
