import { ZQLDatabase } from "@rocicorp/zero/pg";
import { eq, sql } from "drizzle-orm";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { pgTable, text } from "drizzle-orm/pg-core";
import { drizzle as drizzlePostgresJs } from "drizzle-orm/postgres-js";
import { afterAll, beforeAll, describe, expectTypeOf, test } from "vitest";
import { drizzleZeroConfig } from "../src";
import {
  NodePgConnection,
  type NodePgZeroTransaction,
} from "../src/node-postgres";
import {
  PostgresJsConnection,
  type PostgresJsZeroTransaction,
} from "../src/postgres-js";
import { pool, postgresJsClient, shutdown, startPostgres } from "./container";

const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
});

const drizzleSchema = {
  user: userTable,
};

const schema = drizzleZeroConfig(drizzleSchema, {
  tables: {
    user: {
      id: true,
      name: true,
    },
  },
});

const getRandomUser = () => {
  const id = Math.random().toString(36).substring(2, 15);

  const newUser = {
    id,
    name: `John Doe ${id}`,
  };

  return newUser;
};

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

  test("types", async () => {
    const s = null as unknown as NodePgZeroTransaction<typeof drizzleSchema>;

    const user = null as unknown as Awaited<
      ReturnType<typeof s.query.user.findFirst>
    >;

    expectTypeOf(user).toExtend<
      { id: string; name: string | null } | undefined
    >();
  });

  test("zql", async ({ expect }) => {
    const newUser = getRandomUser();

    await db.insert(drizzleSchema.user).values(newUser);

    const zql = new ZQLDatabase(new NodePgConnection(db), schema);

    const result = await zql.transaction(
      async (tx) => {
        const result = await tx.query.user.where("id", "=", newUser.id);
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
    expect(result[0]?.id).toEqual(newUser.id);
  });

  test("can query from the database", async ({ expect }) => {
    const newUser = getRandomUser();

    await db.insert(drizzleSchema.user).values(newUser);

    const drizzleConnection = new NodePgConnection(db);
    const result = await drizzleConnection.query(
      'SELECT * FROM "user" WHERE id = $1',
      [newUser.id],
    );
    expect(result[0]?.name).toBe(newUser.name);
    expect(result[0]?.id).toBe(newUser.id);
  });

  test("can query from the database in a transaction", async ({ expect }) => {
    const newUser = getRandomUser();

    await db.insert(drizzleSchema.user).values(newUser);

    const drizzleConnection = new NodePgConnection(db);
    const result = await drizzleConnection.transaction(async (tx) => {
      const result = await tx.query('SELECT * FROM "user" WHERE id = $1', [
        newUser.id,
      ]);
      return result;
    });

    for await (const row of result) {
      expect(row.name).toBe(newUser.name);
      expect(row.id).toBe(newUser.id);
    }
  });

  test("can query from the database in a transaction", async ({ expect }) => {
    const newUser = getRandomUser();

    await db.insert(drizzleSchema.user).values(newUser);

    const drizzleConnection = new NodePgConnection(db);
    const result = await drizzleConnection.transaction(async (tx) => {
      const result = await tx.query('SELECT * FROM "user" WHERE id = $1', [
        newUser.id,
      ]);
      return result;
    });

    for await (const row of result) {
      expect(row.name).toBe(newUser.name);
      expect(row.id).toBe(newUser.id);
    }
  });

  test("can use the underlying wrappedTransaction", async ({ expect }) => {
    const newUser = getRandomUser();

    await db.insert(drizzleSchema.user).values(newUser);

    const drizzleConnection = new NodePgConnection(db);
    const result = await drizzleConnection.transaction(async (tx) => {
      return tx.wrappedTransaction.query.user.findFirst({
        where: eq(drizzleSchema.user.id, newUser.id),
      });
    });

    expect(result?.name).toBe(newUser.name);
    expect(result?.id).toBe(newUser.id);
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
    const newUser = getRandomUser();

    await db.insert(drizzleSchema.user).values(newUser);

    const zql = new ZQLDatabase(new PostgresJsConnection(db), schema);

    const result = await zql.transaction(
      async (tx) => {
        const result = await tx.query.user.where("id", "=", newUser.id);
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
    expect(result[0]?.id).toEqual(newUser.id);
  });

  test("types", async () => {
    const s = null as unknown as PostgresJsZeroTransaction<typeof drizzleSchema>;

    const user = null as unknown as Awaited<
      ReturnType<typeof s.query.user.findFirst>
    >;

    expectTypeOf(user).toExtend<
      { id: string; name: string | null } | undefined
    >();
  });

  test("can query from the database", async ({ expect }) => {
    const newUser = getRandomUser();

    await db.insert(drizzleSchema.user).values(newUser);

    const drizzleConnection = new PostgresJsConnection(db);
    const result = await drizzleConnection.query(
      'SELECT * FROM "user" WHERE id = $1',
      [newUser.id],
    );
    expect(result[0]?.name).toBe(newUser.name);
    expect(result[0]?.id).toBe(newUser.id);
  });

  test("can query from the database in a transaction", async ({ expect }) => {
    const newUser = getRandomUser();

    await db.insert(drizzleSchema.user).values(newUser);

    const drizzleConnection = new PostgresJsConnection(db);
    const result = await drizzleConnection.transaction(async (tx) => {
      const result = await tx.query('SELECT * FROM "user" WHERE id = $1', [
        newUser.id,
      ]);
      return result;
    });

    for await (const row of result) {
      expect(row.name).toBe(newUser.name);
      expect(row.id).toBe(newUser.id);
    }
  });

  test("can query from the database in a transaction", async ({ expect }) => {
    const newUser = getRandomUser();

    await db.insert(drizzleSchema.user).values(newUser);

    const drizzleConnection = new PostgresJsConnection(db);
    const result = await drizzleConnection.transaction(async (tx) => {
      const result = await tx.query('SELECT * FROM "user" WHERE id = $1', [
        newUser.id,
      ]);
      return result;
    });

    for await (const row of result) {
      expect(row.name).toBe(newUser.name);
      expect(row.id).toBe(newUser.id);
    }
  });

  test("can use the underlying wrappedTransaction", async ({ expect }) => {
    const newUser = getRandomUser();

    await db.insert(drizzleSchema.user).values(newUser);

    const drizzleConnection = new PostgresJsConnection(db);
    const result = await drizzleConnection.transaction(async (tx) => {
      return tx.wrappedTransaction.query.user.findFirst({
        where: eq(drizzleSchema.user.id, newUser.id),
      });
    });

    expect(result?.name).toBe(newUser.name);
    expect(result?.id).toBe(newUser.id);
  });
});
