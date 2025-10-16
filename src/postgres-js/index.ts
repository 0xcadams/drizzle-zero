import type { PgTransaction } from "drizzle-orm/pg-core";
import type {
  PostgresJsDatabase,
  PostgresJsQueryResultHKT,
} from "drizzle-orm/postgres-js";
import type { ExtractTablesWithRelations } from "drizzle-orm/relations";
import type postgres from "postgres";

/**
 * @deprecated use `DrizzleTransaction` from `@rocicorp/zero/server/adapters/drizzle` instead.
 * @see https://zero.rocicorp.dev/docs/zql-on-the-server#drizzle
 */
export type PostgresJsZeroTransaction<
  TDbOrSchema extends
    | (PostgresJsDatabase<Record<string, unknown>> & {
        $client: postgres.Sql<{}>;
      })
    | Record<string, unknown>,
  TSchema extends Record<
    string,
    unknown
  > = TDbOrSchema extends PostgresJsDatabase<infer TSchema>
    ? TSchema
    : TDbOrSchema,
> = PgTransaction<
  PostgresJsQueryResultHKT,
  TSchema,
  ExtractTablesWithRelations<TSchema>
>;

/**
 * @deprecated use `zeroDrizzle` from `@rocicorp/zero/server/adapters/drizzle` instead.
 * @see https://zero.rocicorp.dev/docs/zql-on-the-server#drizzle
 */
export class PostgresJsConnection<
  TDrizzle extends PostgresJsDatabase<Record<string, unknown>> & {
    $client: postgres.Sql<{}>;
  },
  TSchema extends TDrizzle extends PostgresJsDatabase<infer TSchema>
    ? TSchema
    : never,
  TTransaction extends PostgresJsZeroTransaction<TDrizzle, TSchema>,
> {
  readonly #drizzle: TDrizzle;

  constructor(drizzle: TDrizzle) {
    this.#drizzle = drizzle;
  }

  query(sql: string, params: unknown[]): Promise<Record<string, unknown>[]> {
    return this.#drizzle.$client.unsafe(
      sql,
      params as postgres.ParameterOrJSON<never>[],
    );
  }

  transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return this.#drizzle.transaction((drizzleTx) =>
      fn(
        new ZeroPostgresJsTransaction<TDrizzle, TSchema, TTransaction>(
          drizzleTx as TTransaction,
        ),
      ),
    );
  }
}

class ZeroPostgresJsTransaction<
  TDrizzle extends PostgresJsDatabase<Record<string, unknown>> & {
    $client: postgres.Sql<{}>;
  },
  TSchema extends TDrizzle extends PostgresJsDatabase<infer TSchema>
    ? TSchema
    : never,
  TTransaction extends PgTransaction<
    PostgresJsQueryResultHKT,
    TSchema,
    ExtractTablesWithRelations<TSchema>
  >,
> {
  readonly wrappedTransaction: TTransaction;

  constructor(drizzleTx: TTransaction) {
    this.wrappedTransaction = drizzleTx;
  }

  query(sql: string, params: unknown[]): Promise<Record<string, unknown>[]> {
    const session = this.wrappedTransaction._.session as unknown as {
      client: TDrizzle["$client"];
    };
    return session.client.unsafe(
      sql,
      params as postgres.ParameterOrJSON<never>[],
    );
  }
}
