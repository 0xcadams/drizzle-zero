import {relations} from 'drizzle-orm/_relations';
import {pgTable, text} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
});

export const usersRelations = relations(users, ({many}) => ({
  author: many(posts, {relationName: 'author'}),
  reviewer: many(posts, {relationName: 'reviewer'}),
}));

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  content: text('content'),
  authorId: text('author_id'),
  reviewerId: text('reviewer_id'),
});

export const postsRelations = relations(posts, ({one}) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
    relationName: 'author',
  }),
  reviewer: one(users, {
    fields: [posts.reviewerId],
    references: [users.id],
    relationName: 'reviewer',
  }),
}));
