import type { DBConnection, DBTransaction, Row } from "@rocicorp/zero/pg";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type {
  PostgresJsDatabase,
  PostgresJsQueryResultHKT,
} from "drizzle-orm/postgres-js";
import type { ExtractTablesWithRelations } from "drizzle-orm/relations";
import type postgres from "postgres";

export class PostgresJsConnection<
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
> implements DBConnection<TTransaction>
{
  readonly #drizzle: TDrizzle;

  constructor(drizzle: TDrizzle) {
    this.#drizzle = drizzle;
  }

  query(sql: string, params: unknown[]): Promise<Row[]> {
    return this.#drizzle.$client.unsafe(
      sql,
      params as postgres.ParameterOrJSON<never>[],
    );
  }

  transaction<T>(
    fn: (tx: DBTransaction<TTransaction>) => Promise<T>,
  ): Promise<T> {
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
> implements DBTransaction<TTransaction>
{
  readonly wrappedTransaction: TTransaction;

  constructor(drizzleTx: TTransaction) {
    this.wrappedTransaction = drizzleTx;
  }

  query(sql: string, params: unknown[]): Promise<Row[]> {
    const session = this.wrappedTransaction._.session as unknown as {
      client: TDrizzle["$client"];
    };
    return session.client.unsafe(
      sql,
      params as postgres.ParameterOrJSON<never>[],
    );
  }
}
