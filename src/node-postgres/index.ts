import type { DBConnection, DBTransaction, Row } from "@rocicorp/zero/pg";
import type {
  NodePgClient,
  NodePgDatabase,
  NodePgQueryResultHKT,
} from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { ExtractTablesWithRelations } from "drizzle-orm/relations";

export class NodePgConnection<
  TDrizzle extends NodePgDatabase<Record<string, unknown>> & {
    $client: NodePgClient;
  },
  TSchema extends TDrizzle extends NodePgDatabase<infer TSchema>
    ? TSchema
    : never,
  TTransaction extends PgTransaction<
    NodePgQueryResultHKT,
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
    return this.#drizzle.$client.query(sql, params).then(({ rows }) => rows);
  }

  transaction<T>(
    fn: (tx: DBTransaction<TTransaction>) => Promise<T>,
  ): Promise<T> {
    return this.#drizzle.transaction((drizzleTx) =>
      fn(
        new ZeroNodePgTransaction<TDrizzle, TSchema, TTransaction>(
          drizzleTx as TTransaction,
        ),
      ),
    );
  }
}

class ZeroNodePgTransaction<
  TDrizzle extends NodePgDatabase<Record<string, unknown>> & {
    $client: NodePgClient;
  },
  TSchema extends TDrizzle extends NodePgDatabase<infer TSchema>
    ? TSchema
    : never,
  TTransaction extends PgTransaction<
    NodePgQueryResultHKT,
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
    return session.client.query(sql, params).then(({ rows }) => rows);
  }
}
