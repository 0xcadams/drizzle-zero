import { relations } from "drizzle-orm";
import { pgSchema, pgTable, text } from "drizzle-orm/pg-core";

const auth = pgSchema("auth");

export const authUsers = auth.table("user", {
  id: text("id").primaryKey(),
  name: text("name"),
});

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
});

export const groups = pgTable("group", {
  id: text("id").primaryKey(),
  authUserId: text("auth_user_id").references(() => authUsers.id),
  userId: text("user_id").references(() => users.id),
});

export const authUsersRelations = relations(authUsers, ({ many }) => ({
  groups: many(groups),
}));

export const usersRelations = relations(users, ({ many }) => ({
  groups: many(groups),
}));

export const groupsRelations = relations(groups, ({ one }) => ({
  authUser: one(authUsers, {
    fields: [groups.authUserId],
    references: [authUsers.id],
  }),
  user: one(users, {
    fields: [groups.userId],
    references: [users.id],
  }),
}));
