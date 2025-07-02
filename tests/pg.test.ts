import { eq, sql } from "drizzle-orm";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePostgresJs } from "drizzle-orm/postgres-js";
import { afterAll, beforeAll, describe, test } from "vitest";
import { DrizzleConnection as DrizzleConnectionNodePg } from "../src/node-postgres";
import { DrizzleConnection as DrizzleConnectionPostgresJs } from "../src/postgres-js";
import { pool, postgresJsClient, shutdown, startPostgres } from "./container";
import * as drizzleSchema from "./schemas/one-to-many.schema";

describe("node-postgres", () => {
  let db = drizzleNodePg(pool, { schema: drizzleSchema });

  beforeAll(async () => {
    await startPostgres();

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "user" (
        id TEXT PRIMARY KEY,
        name TEXT
      )
    `);
  }, 60000);

  afterAll(async () => {
    await shutdown();
  });

  test("can query from the database", async ({ expect }) => {
    const id = Math.random().toString(36).substring(2, 15);

    const newUser = {
      id,
      name: `John Doe ${id}`,
    };

    await db.insert(drizzleSchema.users).values(newUser);

    const drizzleConnection = new DrizzleConnectionNodePg(db);
    const result = await drizzleConnection.query(
      'SELECT * FROM "user" WHERE id = $1',
      [id],
    );
    expect(result[0]?.name).toBe(newUser.name);
    expect(result[0]?.id).toBe(id);
  });

  test("can query from the database in a transaction", async ({ expect }) => {
    const id = Math.random().toString(36).substring(2, 15);

    const newUser = {
      id,
      name: `John Doe ${id}`,
    };

    await db.insert(drizzleSchema.users).values(newUser);

    const drizzleConnection = new DrizzleConnectionNodePg(db);
    const result = await drizzleConnection.transaction(async (tx) => {
      const result = await tx.query('SELECT * FROM "user" WHERE id = $1', [id]);
      return result;
    });

    for await (const row of result) {
      expect(row.name).toBe(newUser.name);
      expect(row.id).toBe(id);
    }
  });

  test("can query from the database in a transaction", async ({ expect }) => {
    const id = Math.random().toString(36).substring(2, 15);

    const newUser = {
      id,
      name: `John Doe ${id}`,
    };

    await db.insert(drizzleSchema.users).values(newUser);

    const drizzleConnection = new DrizzleConnectionNodePg(db);
    const result = await drizzleConnection.transaction(async (tx) => {
      const result = await tx.query('SELECT * FROM "user" WHERE id = $1', [id]);
      return result;
    });

    for await (const row of result) {
      expect(row.name).toBe(newUser.name);
      expect(row.id).toBe(id);
    }
  });

  test("can use the underlying wrappedTransaction", async ({ expect }) => {
    const id = Math.random().toString(36).substring(2, 15);

    const newUser = {
      id,
      name: `John Doe ${id}`,
    };

    await db.insert(drizzleSchema.users).values(newUser);

    const drizzleConnection = new DrizzleConnectionNodePg(db);
    const result = await drizzleConnection.transaction(async (tx) => {
      return tx.wrappedTransaction.query.users.findFirst({
        where: eq(drizzleSchema.users.id, id),
      });
    });

    expect(result?.name).toBe(newUser.name);
    expect(result?.id).toBe(id);
  });
});

describe("postgres-js", () => {
  let db = drizzlePostgresJs(postgresJsClient, { schema: drizzleSchema });

  beforeAll(async () => {
    await startPostgres();

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "user" (
        id TEXT PRIMARY KEY,
        name TEXT
      )
    `);
  }, 60000);

  afterAll(async () => {
    await shutdown();
  });

  test("can query from the database", async ({ expect }) => {
    const id = Math.random().toString(36).substring(2, 15);

    const newUser = {
      id,
      name: `John Doe ${id}`,
    };

    await db.insert(drizzleSchema.users).values(newUser);

    const drizzleConnection = new DrizzleConnectionPostgresJs(db);
    const result = await drizzleConnection.query(
      'SELECT * FROM "user" WHERE id = $1',
      [id],
    );
    expect(result[0]?.name).toBe(newUser.name);
    expect(result[0]?.id).toBe(id);
  });

  test("can query from the database in a transaction", async ({ expect }) => {
    const id = Math.random().toString(36).substring(2, 15);

    const newUser = {
      id,
      name: `John Doe ${id}`,
    };

    await db.insert(drizzleSchema.users).values(newUser);

    const drizzleConnection = new DrizzleConnectionPostgresJs(db);
    const result = await drizzleConnection.transaction(async (tx) => {
      const result = await tx.query('SELECT * FROM "user" WHERE id = $1', [id]);
      return result;
    });

    for await (const row of result) {
      expect(row.name).toBe(newUser.name);
      expect(row.id).toBe(id);
    }
  });

  test("can query from the database in a transaction", async ({ expect }) => {
    const id = Math.random().toString(36).substring(2, 15);

    const newUser = {
      id,
      name: `John Doe ${id}`,
    };

    await db.insert(drizzleSchema.users).values(newUser);

    const drizzleConnection = new DrizzleConnectionPostgresJs(db);
    const result = await drizzleConnection.transaction(async (tx) => {
      const result = await tx.query('SELECT * FROM "user" WHERE id = $1', [id]);
      return result;
    });

    for await (const row of result) {
      expect(row.name).toBe(newUser.name);
      expect(row.id).toBe(id);
    }
  });

  test("can use the underlying wrappedTransaction", async ({ expect }) => {
    const id = Math.random().toString(36).substring(2, 15);

    const newUser = {
      id,
      name: `John Doe ${id}`,
    };

    await db.insert(drizzleSchema.users).values(newUser);

    const drizzleConnection = new DrizzleConnectionPostgresJs(db);
    const result = await drizzleConnection.transaction(async (tx) => {
      return tx.wrappedTransaction.query.users.findFirst({
        where: eq(drizzleSchema.users.id, id),
      });
    });

    expect(result?.name).toBe(newUser.name);
    expect(result?.id).toBe(id);
  });
});
