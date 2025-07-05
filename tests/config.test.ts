import { describe, expect, test } from "vitest";
import { drizzleZeroConfig } from "../src/relations";
import { pgTable, serial, text, primaryKey } from "drizzle-orm/pg-core";

describe("drizzleZeroConfig with explicit table and column configuration", () => {
  const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
  });

  const posts = pgTable("posts", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content"),
    userId: serial("user_id").references(() => users.id),
  });

  const comments = pgTable("comments", {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    postId: serial("post_id").references(() => posts.id),
  });

  const usersToPosts = pgTable(
    "users_to_posts",
    {
      userId: serial("user_id").references(() => users.id),
      postId: serial("post_id").references(() => posts.id),
      role: text("role", { enum: ["owner", "editor"] }),
    },
    (t: any) => ({
      pk: primaryKey({ columns: [t.userId, t.postId] }),
    }),
  );

  const drizzleSchema = { users, posts, comments, usersToPosts };

  test("should include all tables and columns when no config is provided", () => {
    const schema = drizzleZeroConfig(drizzleSchema);

    // All tables should be present
    expect(Object.keys(schema.tables).length).toBe(4);
    expect(new Set(Object.keys(schema.tables))).toStrictEqual(
      new Set(["users", "posts", "comments", "usersToPosts"]),
    );

    // All columns should be present
    expect(
      new Set(Object.keys((schema.tables as any).users.columns)),
    ).toStrictEqual(new Set(["id", "name", "email", "phone"]));
    expect(
      new Set(Object.keys((schema.tables as any).posts.columns)),
    ).toStrictEqual(new Set(["id", "title", "content", "userId"]));
    expect(
      new Set(Object.keys((schema.tables as any).comments.columns)),
    ).toStrictEqual(new Set(["id", "content", "postId"]));
    expect(
      new Set(Object.keys((schema.tables as any).usersToPosts.columns)),
    ).toStrictEqual(new Set(["userId", "postId", "role"]));
  });

  test("should handle explicit table and column configurations", () => {
    const schema = drizzleZeroConfig(drizzleSchema, {
      tables: {
        users: {
          name: true,
          email: false,
          // phone is not mentioned, should be excluded
        },
        usersToPosts: true, // include all columns
        posts: false,
        // comments table is not mentioned, should be excluded
      },
    });

    // `users` and `usersToPosts` should be in the schema
    expect(Object.keys(schema.tables).length).toBe(2);
    expect(new Set(Object.keys(schema.tables))).toStrictEqual(
      new Set(["users", "usersToPosts"]),
    );

    // `posts` and `comments` should be excluded
    expect((schema.tables as any).posts).toBe(undefined);
    expect((schema.tables as any).comments).toBe(undefined);

    // `users` table should have `id` (pk) and `name`
    expect(
      new Set(Object.keys((schema.tables as any).users.columns)),
    ).toStrictEqual(new Set(["id", "name"]));

    // `usersToPosts` table should have all its columns
    expect(
      new Set(Object.keys((schema.tables as any).usersToPosts.columns)),
    ).toStrictEqual(new Set(["userId", "postId", "role"]));
  });
});
