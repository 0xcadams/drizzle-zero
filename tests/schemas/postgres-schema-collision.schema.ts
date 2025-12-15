import {defineRelations} from 'drizzle-orm';
import {pgSchema, pgTable, text} from 'drizzle-orm/pg-core';

const auth = pgSchema('auth');

export const authUsers = auth.table('user', {
  id: text('id').primaryKey(),
  name: text('name'),
});

export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
});

export const groups = pgTable('group', {
  id: text('id').primaryKey(),
  authUserId: text('auth_user_id').references(() => authUsers.id),
  userId: text('user_id').references(() => users.id),
});

export const relations = defineRelations({authUsers, users, groups}, r => ({
  authUsers: {
    groups: r.many.groups(),
  },
  users: {
    groups: r.many.groups(),
  },
  groups: {
    authUser: r.one.authUsers({
      from: r.groups.authUserId,
      to: r.authUsers.id,
    }),
    user: r.one.users({
      from: r.groups.userId,
      to: r.users.id,
    }),
  },
}));
