import type {Table} from 'drizzle-orm';
import {getTableName, is} from 'drizzle-orm';
import {getTableConfig, PgTable} from 'drizzle-orm/pg-core';

/**
 * Get the table config for a given table.
 *
 * @param table - The table to get the config for
 * @returns The table config
 */
export const getTableConfigForDatabase = <T extends Table>(table: T) => {
  if (is(table, PgTable)) {
    return getTableConfig(table);
  }

  throw new Error(
    `drizzle-zero: Unsupported table type: ${getTableName(table)}. Only Postgres tables are supported.`,
  );
};
