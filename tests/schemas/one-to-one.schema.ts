import {defineRelations} from 'drizzle-orm';
import {jsonb, pgTable, text} from 'drizzle-orm/pg-core';

export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
});

export const profileInfo = pgTable('profile_info', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  metadata: jsonb('metadata'),
});

export const relations = defineRelations({users, profileInfo}, r => ({
  users: {
    profileInfo: r.one.profileInfo(),
  },
  profileInfo: {
    user: r.one.users({
      from: r.profileInfo.userId,
      to: r.users.id,
    }),
  },
}));
