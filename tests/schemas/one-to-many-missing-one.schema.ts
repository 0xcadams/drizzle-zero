import {relations} from 'drizzle-orm/_relations';
import {pgTable, text} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
});

export const usersRelations = relations(users, ({many}) => ({
  author: many(posts),
}));

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  content: text('content'),
  authorId: text('author_id'),
});
