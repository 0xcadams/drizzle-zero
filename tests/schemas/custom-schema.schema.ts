import {relations} from 'drizzle-orm/_relations';
import {pgSchema, text} from 'drizzle-orm/pg-core';

export const customSchema = pgSchema('custom');

export const users = customSchema.table('user', {
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
