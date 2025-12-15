import {defineRelations} from 'drizzle-orm';
import {pgTable, primaryKey, text} from 'drizzle-orm/pg-core';

export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
});

export const usersToGroups = pgTable(
  'users_to_group',
  {
    userId: text('user_id').notNull(),
    groupId: text('group_id').notNull(),
  },
  t => [primaryKey({columns: [t.userId, t.groupId]})],
);

export const groups = pgTable('group', {
  id: text('id').primaryKey(),
  name: text('name'),
});

export const relations = defineRelations({users, usersToGroups, groups}, r => ({
  users: {
    groups: r.many.usersToGroups(),
  },
  usersToGroups: {
    group: r.one.groups({
      from: r.usersToGroups.groupId,
      to: r.groups.id,
    }),
    user: r.one.users({
      from: r.usersToGroups.userId,
      to: r.users.id,
    }),
  },
  groups: {
    users: r.many.usersToGroups(),
  },
}));
