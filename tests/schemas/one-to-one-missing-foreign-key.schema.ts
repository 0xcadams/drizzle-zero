import {relations} from 'drizzle-orm/_relations';
import {pgTable, text} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
});

export const usersRelations = relations(users, ({one}) => ({
  userPosts: one(posts),
}));

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  name: text('name'),
  author: text('author').notNull(),
});

export const postsRelations = relations(posts, ({one}) => ({
  postAuthor: one(users, {fields: [posts.author], references: [users.id]}),
}));
