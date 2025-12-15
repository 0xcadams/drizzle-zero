import {defineRelations} from 'drizzle-orm';
import {pgTable, text} from 'drizzle-orm/pg-core';

export const users = pgTable('user', {
  id: text().primaryKey(),
  name: text(),
});

export const posts = pgTable('post', {
  id: text().primaryKey(),
  content: text(),
  authorId: text().references(() => users.id),
});

export const comments = pgTable('comment', {
  id: text().primaryKey(),
  text: text(),
  authorId: text().references(() => users.id),
  postId: text().references(() => posts.id),
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
