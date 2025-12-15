import {defineRelations} from 'drizzle-orm';
import {pgTable, text} from 'drizzle-orm/pg-core';

export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
});

export const posts = pgTable('post', {
  id: text('id').primaryKey(),
  content: text('content'),
  authorId: text('author_id').references(() => users.id),
});

export const comments = pgTable('comment', {
  id: text('id').primaryKey(),
  text: text('text'),
  authorId: text('author_id').references(() => users.id),
  postId: text('post_id').references(() => posts.id),
});

export const relations = defineRelations({users, posts, comments}, r => ({
  users: {
    posts: r.many.posts(),
  },
  posts: {
    author: r.one.users({
      from: r.posts.authorId,
      to: r.users.id,
    }),
  },
  comments: {
    post: r.one.posts({
      from: r.comments.postId,
      to: r.posts.id,
    }),
    author: r.one.users({
      from: r.comments.authorId,
      to: r.users.id,
    }),
  },
}));
