import {defineRelations} from 'drizzle-orm';
import {pgTable, text} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
});

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  content: text('content'),
  authorId: text('author_id'),
});

export const relations = defineRelations({users, posts}, r => ({
  users: {
    author: r.many.posts(),
  },
}));
