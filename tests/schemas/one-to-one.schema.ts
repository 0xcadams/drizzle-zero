import {relations} from 'drizzle-orm';
import {jsonb, pgTable, text} from 'drizzle-orm/pg-core';

export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
});

export const usersRelations = relations(users, ({one}) => ({
  profileInfo: one(profileInfo),
}));

export const profileInfo = pgTable('profile_info', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  metadata: jsonb('metadata'),
});

export const profileInfoRelations = relations(profileInfo, ({one}) => ({
  user: one(users, {fields: [profileInfo.userId], references: [users.id]}),
}));
