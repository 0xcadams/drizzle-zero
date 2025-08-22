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
import {
  pool,
  postgresJsClient,
  shutdown,
  startPostgres,
} from "../db/test-utils";

const countryTable = pgTable("country", {
  id: text("id").primaryKey(),
  name: text("name"),
});

const drizzleSchema = {
  country: countryTable,
};

const schema = drizzleZeroConfig(drizzleSchema, {
  tables: {
    country: {
      id: true,
      name: true,
    },
  },
});

const getRandomCountry = () => {
  const id = Math.random().toString(36).substring(2, 15);

  const newCountry = {
    id,
    name: `Country ${id}`,
  };

  return newCountry;
};

describe("node-postgres", () => {
  let db = drizzleNodePg(pool, { schema: drizzleSchema });

  beforeAll(async () => {
    await startPostgres();

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "country" (
        id TEXT PRIMARY KEY,
        name TEXT
      )
    `);
  }, 60000);

  afterAll(async () => {
    await shutdown();
  });

  test("types - implicit schema generic", async () => {
    const s = null as unknown as NodePgZeroTransaction<typeof db>;

    const country = null as unknown as Awaited<
      ReturnType<typeof s.query.country.findFirst>
    >;

    expectTypeOf(country).toExtend<
      { id: string; name: string | null } | undefined
    >();
  });

  test("types - explicit schema generic", async () => {
    const s = null as unknown as NodePgZeroTransaction<typeof drizzleSchema>;

    const country = null as unknown as Awaited<
      ReturnType<typeof s.query.country.findFirst>
    >;

    expectTypeOf(country).toExtend<
      { id: string; name: string | null } | undefined
    >();
  });

  test("zql", async ({ expect }) => {
    const newCountry = getRandomCountry();

    await db.insert(drizzleSchema.country).values(newCountry);

    const zql = new ZQLDatabase(new NodePgConnection(db), schema);

    const result = await zql.transaction(
      async (tx) => {
        const result = await tx.query.country.where("id", "=", newCountry.id);
        return result;
      },
      {
        upstreamSchema: "",
        clientGroupID: "",
        clientID: "",
        mutationID: 0,
      },
    );

    expect(result[0]?.name).toEqual(newCountry.name);
    expect(result[0]?.id).toEqual(newCountry.id);
  });

  test("can query from the database", async ({ expect }) => {
    const newCountry = getRandomCountry();

    await db.insert(drizzleSchema.country).values(newCountry);

    const drizzleConnection = new NodePgConnection(db);
    const result = await drizzleConnection.query(
      'SELECT * FROM "country" WHERE id = $1',
      [newCountry.id],
    );
    expect(result[0]?.name).toBe(newCountry.name);
    expect(result[0]?.id).toBe(newCountry.id);
  });

  test("can query from the database in a transaction", async ({ expect }) => {
    const newCountry = getRandomCountry();

    await db.insert(drizzleSchema.country).values(newCountry);

    const drizzleConnection = new NodePgConnection(db);
    const result = await drizzleConnection.transaction(async (tx) => {
      const result = await tx.query('SELECT * FROM "country" WHERE id = $1', [
        newCountry.id,
      ]);
      return result;
    });

    for await (const row of result) {
      expect(row.name).toBe(newCountry.name);
      expect(row.id).toBe(newCountry.id);
    }
  });

  test("can use the underlying wrappedTransaction", async ({ expect }) => {
    const newCountry = getRandomCountry();

    await db.insert(drizzleSchema.country).values(newCountry);

    const drizzleConnection = new NodePgConnection(db);
    const result = await drizzleConnection.transaction(async (tx) => {
      return tx.wrappedTransaction.query.country.findFirst({
        where: eq(drizzleSchema.country.id, newCountry.id),
      });
    });

    expect(result?.name).toBe(newCountry.name);
    expect(result?.id).toBe(newCountry.id);
  });
});

describe("postgres-js", () => {
  let db = drizzlePostgresJs(postgresJsClient, { schema: drizzleSchema });

  beforeAll(async () => {
    await startPostgres();

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "country" (
        id TEXT PRIMARY KEY,
        name TEXT
      )
    `);
  }, 60000);

  afterAll(async () => {
    await shutdown();
  });

  test("zql", async ({ expect }) => {
    const newCountry = getRandomCountry();

    await db.insert(drizzleSchema.country).values(newCountry);

    const zql = new ZQLDatabase(new PostgresJsConnection(db), schema);

    const result = await zql.transaction(
      async (tx) => {
        const result = await tx.query.country.where("id", "=", newCountry.id);
        return result;
      },
      {
        upstreamSchema: "",
        clientGroupID: "",
        clientID: "",
        mutationID: 0,
      },
    );

    expect(result[0]?.name).toEqual(newCountry.name);
    expect(result[0]?.id).toEqual(newCountry.id);
  });

  test("types - implicit schema generic", async () => {
    const s = null as unknown as PostgresJsZeroTransaction<typeof db>;

    const country = null as unknown as Awaited<
      ReturnType<typeof s.query.country.findFirst>
    >;

    expectTypeOf(country).toExtend<
      { id: string; name: string | null } | undefined
    >();
  });

  test("types - explicit schema generic", async () => {
    const s = null as unknown as PostgresJsZeroTransaction<
      typeof drizzleSchema
    >;

    const country = null as unknown as Awaited<
      ReturnType<typeof s.query.country.findFirst>
    >;

    expectTypeOf(country).toExtend<
      { id: string; name: string | null } | undefined
    >();
  });

  test("can query from the database", async ({ expect }) => {
    const newCountry = getRandomCountry();

    await db.insert(drizzleSchema.country).values(newCountry);

    const drizzleConnection = new PostgresJsConnection(db);
    const result = await drizzleConnection.query(
      'SELECT * FROM "country" WHERE id = $1',
      [newCountry.id],
    );
    expect(result[0]?.name).toBe(newCountry.name);
    expect(result[0]?.id).toBe(newCountry.id);
  });

  test("can query from the database in a transaction", async ({ expect }) => {
    const newCountry = getRandomCountry();

    await db.insert(drizzleSchema.country).values(newCountry);

    const drizzleConnection = new PostgresJsConnection(db);
    const result = await drizzleConnection.transaction(async (tx) => {
      const result = await tx.query('SELECT * FROM "country" WHERE id = $1', [
        newCountry.id,
      ]);
      return result;
    });

    for await (const row of result) {
      expect(row.name).toBe(newCountry.name);
      expect(row.id).toBe(newCountry.id);
    }
  });

  test("can use the underlying wrappedTransaction", async ({ expect }) => {
    const newCountry = getRandomCountry();

    await db.insert(drizzleSchema.country).values(newCountry);

    const drizzleConnection = new PostgresJsConnection(db);
    const result = await drizzleConnection.transaction(async (tx) => {
      return tx.wrappedTransaction.query.country.findFirst({
        where: eq(drizzleSchema.country.id, newCountry.id),
      });
    });

    expect(result?.name).toBe(newCountry.name);
    expect(result?.id).toBe(newCountry.id);
  });
});
