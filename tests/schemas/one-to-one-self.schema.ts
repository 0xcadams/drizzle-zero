import {relations} from 'drizzle-orm/_relations';
import {pgTable, text} from 'drizzle-orm/pg-core';

export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  invitedBy: text('invited_by'),
});

export const usersRelations = relations(users, ({one}) => ({
  invitee: one(users, {
    fields: [users.invitedBy],
    references: [users.id],
  }),
}));
