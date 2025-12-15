import {defineRelations} from 'drizzle-orm';
import {pgSchema, text} from 'drizzle-orm/pg-core';

export const customSchema = pgSchema('custom');

export const users = customSchema.table('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  invitedBy: text('invited_by'),
});

export const relations = defineRelations({users}, r => ({
  users: {
    invitee: r.one.users({
      from: r.users.invitedBy,
      to: r.users.id,
    }),
  },
}));
