import {relations} from 'drizzle-orm/_relations';
import {pgTable, text} from 'drizzle-orm/pg-core';

export const users = pgTable('user', {
  id: text().primaryKey(),
  name: text(),
});

export const usersRelations = relations(users, ({many}) => ({
  posts: many(posts),
}));

export const posts = pgTable('post', {
  id: text().primaryKey(),
  content: text(),
  authorId: text().references(() => users.id),
});

export const postsRelations = relations(posts, ({one}) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

export const comments = pgTable('comment', {
  id: text().primaryKey(),
  text: text(),
  authorId: text().references(() => users.id),
  postId: text().references(() => posts.id),
});

export const commentsRelations = relations(comments, ({one}) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));
