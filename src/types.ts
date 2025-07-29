import type { Table } from "drizzle-orm";
import type { ColumnsConfig } from "./tables";

/**
 * Gets the keys of columns that can be used as indexes.
 * @template TTable - The table to get index keys from
 */
export type ColumnIndexKeys<TTable extends Table> = {
  [K in keyof Columns<TTable>]: K;
}[keyof Columns<TTable>];

/**
 * Configuration type for specifying which tables and columns to include in the Zero schema.
 * @template TDrizzleSchema - The complete Drizzle schema
 */
export type TableColumnsConfig<TDrizzleSchema extends Record<string, unknown>> =
  Partial<
    Flatten<{
      /**
       * The columns to include in the Zero schema.
       */
      readonly [K in keyof TDrizzleSchema as TDrizzleSchema[K] extends Table<any>
        ? K
        : never]: TDrizzleSchema[K] extends Table<any>
        ? ColumnsConfig<TDrizzleSchema[K]>
        : never;
    }>
  >;

/**
 * A default config type which includes all tables in the Drizzle schema.
 * @template TDrizzleSchema - The complete Drizzle schema
 */
export type DefaultTableColumnsConfig<
  TDrizzleSchema extends Record<string, unknown>,
> = Flatten<{
  readonly [K in keyof TDrizzleSchema as TDrizzleSchema[K] extends Table<any>
    ? K
    : never]: TDrizzleSchema[K] extends Table<any>
    ? DefaultColumnsConfig<TDrizzleSchema[K]>
    : never;
}>;

/**
 * A default config type which includes all columns in a Drizzle table.
 * @template TTable - The Drizzle table type
 */
type DefaultColumnsConfig<TTable extends Table> = {
  readonly [K in ColumnNames<TTable>]: true;
};

/**
 * Gets all columns from a Drizzle table type.
 * @template TTable The Drizzle table type
 */
export type Columns<TTable extends Table> = TTable["_"]["columns"];

/**
 * Gets all column names from a Drizzle table type.
 * @template TTable The Drizzle table type
 */
export type ColumnNames<TTable extends Table> = keyof Columns<TTable>;

/**
 * Helper type that extracts primary key columns from a table.
 * @template T The Drizzle table type
 */
type PrimaryKeyColumns<T extends Table> = {
  [K in keyof Columns<T>]: Columns<T>[K]["_"]["isPrimaryKey"] extends true
    ? K extends string
      ? K
      : never
    : never;
}[keyof Columns<T>];

/**
 * Finds the primary key(s) from a table.
 * @template T The Drizzle table type
 */
export type FindPrimaryKeyFromTable<T extends Table> = [
  PrimaryKeyColumns<T>,
] extends [never]
  ? [never]
  : [PrimaryKeyColumns<T>];

/**
 * Type guard that checks if a type is a Table with a specific name.
 * @template T The type to check
 * @template Name The name to check for
 */
type IsTableWithName<T, Name extends string> = T extends { _: { name: Name } }
  ? T extends Table<any>
    ? true
    : false
  : false;

/**
 * Finds a table in the schema by its name.
 * @template TDrizzleSchema The complete Drizzle schema
 * @template Name The name of the table to find
 */
export type FindTableByName<
  TDrizzleSchema extends Record<string, unknown>,
  Name extends string,
> = Extract<
  {
    [P in keyof TDrizzleSchema]: IsTableWithName<
      TDrizzleSchema[P],
      Name
    > extends true
      ? TDrizzleSchema[P]
      : never;
  }[keyof TDrizzleSchema],
  Table<any>
>;

/**
 * Utility type that flattens an object type by removing any intermediate interfaces.
 * @template T The type to flatten
 */
export type Flatten<T> = {
  [K in keyof T]: T[K];
} & {};
