import {defineRelations} from 'drizzle-orm';
import {pgTable, text} from 'drizzle-orm/pg-core';

export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  posts: text('posts'), // This column name will conflict with the relationship name
});

export const posts = pgTable('post', {
  id: text('id').primaryKey(),
  content: text('content'),
  authorId: text('author_id').references(() => users.id),
});

export const relations = defineRelations({users, posts}, r => ({
  users: {
    posts: r.many.posts(),
  },
  posts: {
    author: r.one.users({
      from: r.posts.authorId,
      to: r.users.id,
    }),
  },
}));
