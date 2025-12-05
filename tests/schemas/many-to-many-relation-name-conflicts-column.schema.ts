import {relations} from 'drizzle-orm';
import {pgTable, primaryKey, text} from 'drizzle-orm/pg-core';

export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  groups: text('groups'), // This column will conflict with many-to-many relationship
});

export const usersToGroups = pgTable(
  'users_to_group',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    groupId: text('group_id')
      .notNull()
      .references(() => groups.id),
  },
  t => [primaryKey({columns: [t.userId, t.groupId]})],
);

export const groups = pgTable('group', {
  id: text('id').primaryKey(),
  name: text('name'),
});

export const usersRelations = relations(users, ({many}) => ({
  usersToGroups: many(usersToGroups),
}));

export const usersToGroupsRelations = relations(usersToGroups, ({one}) => ({
  group: one(groups, {
    fields: [usersToGroups.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [usersToGroups.userId],
    references: [users.id],
  }),
}));

export const groupsRelations = relations(groups, ({many}) => ({
  usersToGroups: many(usersToGroups),
}));
