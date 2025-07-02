import { ZQLDatabase } from "@rocicorp/zero/pg";
import { eq, sql } from "drizzle-orm";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePostgresJs } from "drizzle-orm/postgres-js";
import { afterAll, beforeAll, describe, test } from "vitest";
import { NodePgConnection } from "../src/node-postgres";
import { PostgresJsConnection } from "../src/postgres-js";
import { pool, postgresJsClient, shutdown, startPostgres } from "./container";
import * as drizzleSchema from "./schemas/one-to-many.schema";
import { createSchema, string, table } from "@rocicorp/zero";

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

  test("zql", async ({ expect }) => {
    const id = Math.random().toString(36).substring(2, 15);

    const newUser = {
      id,
      name: `John Doe ${id}`,
    };

    await db.insert(drizzleSchema.users).values(newUser);

    const schema = createSchema({
      tables: [
        table("user")
          .columns({
            id: string(),
            name: string(),
          })
          .primaryKey("id"),
      ],
    });

    const zql = new ZQLDatabase(new NodePgConnection(db), schema);

    const result = await zql.transaction(
      async (tx) => {
        const result = await tx.query.user.where("id", "=", id);
        return result;
      },
      {
        upstreamSchema: "",
        clientGroupID: "",
        clientID: "",
        mutationID: 0,
      },
    );

    expect(result[0]?.name).toEqual(newUser.name);
    expect(result[0]?.id).toEqual(id);
  });

  test("can query from the database", async ({ expect }) => {
    const id = Math.random().toString(36).substring(2, 15);

    const newUser = {
      id,
      name: `John Doe ${id}`,
    };

    await db.insert(drizzleSchema.users).values(newUser);

    const drizzleConnection = new NodePgConnection(db);
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

    const drizzleConnection = new NodePgConnection(db);
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

    const drizzleConnection = new NodePgConnection(db);
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

    const drizzleConnection = new NodePgConnection(db);
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

  test("zql", async ({ expect }) => {
    const id = Math.random().toString(36).substring(2, 15);

    const newUser = {
      id,
      name: `John Doe ${id}`,
    };

    await db.insert(drizzleSchema.users).values(newUser);

    const schema = createSchema({
      tables: [
        table("user")
          .columns({
            id: string(),
            name: string(),
          })
          .primaryKey("id"),
      ],
    });

    const zql = new ZQLDatabase(new PostgresJsConnection(db), schema);

    const result = await zql.transaction(
      async (tx) => {
        const result = await tx.query.user.where("id", "=", id);
        return result;
      },
      {
        upstreamSchema: "",
        clientGroupID: "",
        clientID: "",
        mutationID: 0,
      },
    );

    expect(result[0]?.name).toEqual(newUser.name);
    expect(result[0]?.id).toEqual(id);
  });

  test("can query from the database", async ({ expect }) => {
    const id = Math.random().toString(36).substring(2, 15);

    const newUser = {
      id,
      name: `John Doe ${id}`,
    };

    await db.insert(drizzleSchema.users).values(newUser);

    const drizzleConnection = new PostgresJsConnection(db);
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

    const drizzleConnection = new PostgresJsConnection(db);
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

    const drizzleConnection = new PostgresJsConnection(db);
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

    const drizzleConnection = new PostgresJsConnection(db);
    const result = await drizzleConnection.transaction(async (tx) => {
      return tx.wrappedTransaction.query.users.findFirst({
        where: eq(drizzleSchema.users.id, id),
      });
    });

    expect(result?.name).toBe(newUser.name);
    expect(result?.id).toBe(id);
  });
});
