import type {
  NodePgClient,
  NodePgDatabase,
  NodePgQueryResultHKT,
} from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { ExtractTablesWithRelations } from "drizzle-orm/relations";

/**
 * @deprecated use `DrizzleTransaction` from `@rocicorp/zero/server/adapters/drizzle` instead.
 * @see https://zero.rocicorp.dev/docs/zql-on-the-server#drizzle
 */
export type NodePgZeroTransaction<
  TDbOrSchema extends
    | (NodePgDatabase<Record<string, unknown>> & { $client: NodePgClient })
    | Record<string, unknown>,
  TSchema extends Record<string, unknown> = TDbOrSchema extends NodePgDatabase<
    infer TSchema
  >
    ? TSchema
    : TDbOrSchema,
> = PgTransaction<
  NodePgQueryResultHKT,
  TSchema,
  ExtractTablesWithRelations<TSchema>
>;

/**
 * @deprecated use `zeroDrizzle` from `@rocicorp/zero/server/adapters/drizzle` instead.
 * @see https://zero.rocicorp.dev/docs/zql-on-the-server#drizzle
 */
export class NodePgConnection<
  TDrizzle extends NodePgDatabase<Record<string, unknown>> & {
    $client: NodePgClient;
  },
  TSchema extends TDrizzle extends NodePgDatabase<infer TSchema>
    ? TSchema
    : never,
  TTransaction extends NodePgZeroTransaction<TDrizzle, TSchema>,
> {
  readonly #drizzle: TDrizzle;

  constructor(drizzle: TDrizzle) {
    this.#drizzle = drizzle;
  }

  query(sql: string, params: unknown[]): Promise<Record<string, unknown>[]> {
    return this.#drizzle.$client.query(sql, params).then(({ rows }) => rows);
  }

  transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
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
> {
  readonly wrappedTransaction: TTransaction;

  constructor(drizzleTx: TTransaction) {
    this.wrappedTransaction = drizzleTx;
  }

  query(sql: string, params: unknown[]): Promise<Record<string, unknown>[]> {
    const session = this.wrappedTransaction._.session as unknown as {
      client: TDrizzle["$client"];
    };
    return session.client.query(sql, params).then(({ rows }) => rows);
  }
}
