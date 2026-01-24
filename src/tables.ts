import {
  type ColumnBuilder,
  type ReadonlyJSONValue,
  type TableBuilderWithColumns,
  type ValueType,
  boolean as zeroBoolean,
  enumeration as zeroEnumeration,
  json as zeroJson,
  number as zeroNumber,
  string as zeroString,
  table as zeroTable,
} from '@rocicorp/zero';
import type {Table} from 'drizzle-orm';
import {getColumns, getTableName} from 'drizzle-orm';
import {toCamelCase, toSnakeCase} from 'drizzle-orm/casing';
import {getTableConfigForDatabase} from './db';
import {
  type DrizzleColumnTypeToZeroType,
  drizzleColumnTypeToZeroType,
  type DrizzleDataTypeToZeroType,
  drizzleDataTypeToZeroType,
  postgresTypeToZeroType,
  type ZeroTypeToTypescriptType,
} from './drizzle-to-zero';
import type {
  ColumnNames,
  Columns,
  FindPrimaryKeyFromTable,
  Flatten,
} from './types';
import {debugLog, typedEntries} from './util';

const warnedServerDefaults = new Set<string>();

export type {ColumnBuilder, ReadonlyJSONValue, TableBuilderWithColumns};

/**
 * Represents a column definition from a Drizzle table, filtered by column name.
 * @template TTable The Drizzle table type
 * @template K The column name to filter by
 */
type ColumnDefinition<TTable extends Table, K extends ColumnNames<TTable>> = {
  [C in keyof Columns<TTable>]: C extends K ? Columns<TTable>[C] : never;
}[keyof Columns<TTable>];

/**
 * The type override for a column.
 * Used to customize how a Drizzle column is mapped to a Zero schema.
 * @template TCustomType The TypeScript type that corresponds to the Zero type
 */
type TypeOverride<TCustomType> = {
  readonly type: 'string' | 'number' | 'boolean' | 'json';
  readonly optional: boolean;
  readonly customType: TCustomType;
  readonly kind?: 'enum';
};

/**
 * Configuration for specifying which columns to include in the Zero schema and how to map them.
 * @template TTable The Drizzle table type
 */
export type ColumnsConfig<TTable extends Table> =
  | boolean
  | Partial<{
      /**
       * The columns to include in the Zero schema.
       * Set to true to use default mapping, or provide a TypeOverride for custom mapping.
       */
      readonly [KColumn in ColumnNames<TTable>]:
        | boolean
        | ColumnBuilder<
            TypeOverride<
              ZeroTypeToTypescriptType[DrizzleDataTypeToZeroType[Columns<TTable>[KColumn]['dataType']]]
            >
          >;
    }>;

/**
 * Maps a Drizzle column type to its corresponding Zero type.
 */
type ZeroMappedColumnType<
  TTable extends Table,
  KColumn extends ColumnNames<TTable>,
  CD extends ColumnDefinition<TTable, KColumn>['_'] = ColumnDefinition<
    TTable,
    KColumn
  >['_'],
> = CD extends {
  columnType: keyof DrizzleColumnTypeToZeroType;
}
  ? DrizzleColumnTypeToZeroType[CD['columnType']]
  : DrizzleDataTypeToZeroType[CD['dataType']];

/**
 * Maps a Drizzle column to its corresponding TypeScript type in Zero.
 * Handles special cases like enums and custom types.
 */
type ZeroMappedCustomType<
  TTable extends Table,
  KColumn extends ColumnNames<TTable>,
  CD extends ColumnDefinition<TTable, KColumn>['_'] = ColumnDefinition<
    TTable,
    KColumn
  >['_'],
> = CD extends {
  columnType: 'PgCustomColumn';
}
  ? CD['data']
  : CD extends {
        columnType: 'PgEnumColumn';
      }
    ? CD['data']
    : CD extends {
          columnType: 'PgText';
          data: string;
        }
      ? CD['data']
      : CD extends {
            columnType: 'PgArray';
            data: infer TArrayData;
          }
        ? TArrayData
        : CD extends {$type: any}
          ? CD['$type']
          : ZeroTypeToTypescriptType[ZeroMappedColumnType<TTable, KColumn>];

/**
 * Defines the structure of a column in the Zero schema.
 */
type ZeroColumnDefinition<
  TTable extends Table,
  KColumn extends ColumnNames<TTable>,
> = Flatten<{
  optional: boolean;
  type: ValueType;
  customType: ZeroMappedCustomType<TTable, KColumn>;
  serverName?: string;
}>;

/**
 * Maps the columns configuration to their Zero schema definitions.
 */
export type ZeroColumns<
  TTable extends Table,
  TColumnConfig extends ColumnsConfig<TTable> | undefined,
> = {
  [KColumn in ColumnNames<TTable>]: KColumn extends keyof TColumnConfig
    ? TColumnConfig[KColumn & keyof TColumnConfig] extends ColumnBuilder<any>
      ? TColumnConfig[KColumn & keyof TColumnConfig]['schema']
      : ZeroColumnDefinition<TTable, KColumn>
    : ZeroColumnDefinition<TTable, KColumn>;
};

/**
 * Represents the underlying schema for a Zero table.
 */
export type ZeroTableBuilderSchema<
  TTableName extends string,
  TTable extends Table,
  TColumnConfig extends ColumnsConfig<TTable> | undefined,
> = Flatten<{
  name: TTableName;
  primaryKey: FindPrimaryKeyFromTable<TTable> extends [never]
    ? readonly [string, ...string[]]
    : readonly [string, ...string[]] & FindPrimaryKeyFromTable<TTable>;
  columns: Flatten<ZeroColumns<TTable, TColumnConfig>>;
}>; // Zero does not support this properly yet: & (TTable['_']['name'] extends TTableName ? {} : { serverName: string });

/**
 * Represents the complete Zero schema for a Drizzle table.
 */
type ZeroTableBuilder<
  TTableName extends string,
  TTable extends Table,
  TColumnConfig extends ColumnsConfig<TTable>,
> = TableBuilderWithColumns<
  Readonly<ZeroTableBuilderSchema<TTableName, TTable, TColumnConfig>>
>;

/**
 * Casing for the Zero table builder.
 */
export type ZeroTableCasing = 'snake_case' | 'camelCase' | undefined;

/**
 * Creates a Zero schema from a Drizzle table definition.
 *
 * @returns A Zero schema definition for the table
 * @throws {Error} If primary key configuration is invalid or column types are unsupported
 */
const createZeroTableBuilder = <
  TTableName extends string,
  TTable extends Table,
  TColumnConfig extends ColumnsConfig<TTable>,
  TCasing extends ZeroTableCasing = ZeroTableCasing,
>(
  /**
   * The mapped name of the table
   */
  tableName: TTableName,
  /**
   * The Drizzle table instance
   */
  table: TTable,
  /**
   * Configuration specifying which columns to include and how to map them
   */
  columns?: TColumnConfig,
  /**
   * Whether to enable debug mode.
   */
  debug?: boolean,
  /**
   * The casing to use for the table name.
   */
  casing?: TCasing,
  /**
   * Whether to hide warnings for columns with default values.
   */
  suppressDefaultsWarning?: boolean,
): ZeroTableBuilder<TTableName, TTable, TColumnConfig> => {
  const actualTableName = getTableName(table);
  const tableColumns = getColumns(table);
  const tableConfig = getTableConfigForDatabase(table);

  const columnNameToStableKey = new Map<string, string>(
    typedEntries(tableColumns).map(([key, column]) => [
      column.name,
      String(key),
    ]),
  );

  const primaryKeys = new Set<string>();
  for (const [key, column] of typedEntries(tableColumns)) {
    if (column.primary) {
      primaryKeys.add(String(key));
    }
  }

  for (const pk of tableConfig.primaryKeys) {
    for (const pkColumn of pk.columns) {
      const key = columnNameToStableKey.get(pkColumn.name);
      if (key) {
        primaryKeys.add(String(key));
      }
    }
  }

  const isColumnBuilder = (value: unknown): value is ColumnBuilder<any> =>
    typeof value === 'object' && value !== null && 'schema' in value;

  const columnsMapped = typedEntries(tableColumns).reduce(
    (acc, [key, column]) => {
      const columnConfig =
        typeof columns === 'object' && columns !== null && columns !== undefined
          ? columns?.[key as keyof TColumnConfig]
          : undefined;

      const isColumnConfigOverride = isColumnBuilder(columnConfig);

      // From https://github.com/drizzle-team/drizzle-orm/blob/e5c63db0df0eaff5cae8321d97a77e5b47c5800d/drizzle-kit/src/serializer/utils.ts#L5
      const resolvedColumnName =
        !column.keyAsName || casing === undefined
          ? column.name
          : casing === 'camelCase'
            ? toCamelCase(column.name)
            : toSnakeCase(column.name);

      if (typeof columns === 'object' && columns !== null) {
        if (
          columnConfig !== undefined &&
          typeof columnConfig !== 'boolean' &&
          !isColumnConfigOverride
        ) {
          throw new Error(
            `drizzle-zero: Invalid column config for column ${resolvedColumnName} - expected boolean or ColumnBuilder but was ${typeof columnConfig}`,
          );
        }

        if (
          columnConfig !== true &&
          !isColumnConfigOverride &&
          !primaryKeys.has(String(key))
        ) {
          debugLog(
            debug,
            `Skipping non-primary column ${resolvedColumnName} because it was not explicitly included in the config.`,
          );
          return acc;
        }
      }

      const type =
        drizzleColumnTypeToZeroType[
          column.columnType as keyof typeof drizzleColumnTypeToZeroType
        ] ??
        drizzleDataTypeToZeroType[
          column.dataType as keyof typeof drizzleDataTypeToZeroType
        ] ??
        postgresTypeToZeroType[
          column.getSQLType() as keyof typeof postgresTypeToZeroType
        ] ??
        null;

      if (type === null && !isColumnConfigOverride) {
        console.warn(
          `🚨  drizzle-zero: Unsupported column type: ${resolvedColumnName} - ${column.columnType} (${column.dataType}). It will not be included in the output. Must be supported by Zero, e.g.: ${Object.keys({...drizzleDataTypeToZeroType, ...drizzleColumnTypeToZeroType}).join(' | ')}`,
        );

        return acc;
      }

      const isPrimaryKey = primaryKeys.has(String(key));
      const hasServerDefault =
        column.hasDefault || typeof column.defaultFn !== 'undefined';

      if (hasServerDefault && !suppressDefaultsWarning) {
        const warningKey = `${actualTableName}.${resolvedColumnName}`;
        if (!warnedServerDefaults.has(warningKey)) {
          warnedServerDefaults.add(warningKey);

          console.warn(
            `⚠️ drizzle-zero: Column ${actualTableName}.${resolvedColumnName} uses a database default that the Zero client will not be able to use. This probably won't work the way you expect. Set the value with mutators instead. See: https://bugs.rocicorp.dev/p/zero/issue/3465`,
          );
        }
      }

      const isColumnOptional =
        typeof columnConfig === 'boolean' || typeof columnConfig === 'undefined'
          ? isPrimaryKey
            ? false // Primary keys are NEVER optional, even with defaults
            : hasServerDefault
              ? true
              : !column.notNull
          : isColumnConfigOverride
            ? columnConfig.schema.optional
            : false;

      if (columnConfig && typeof columnConfig !== 'boolean') {
        return {
          ...acc,
          [key]: columnConfig,
        };
      }

      const schemaValue = column.enumValues
        ? zeroEnumeration<typeof column.enumValues>()
        : type === 'string'
          ? zeroString()
          : type === 'number'
            ? zeroNumber()
            : type === 'json'
              ? zeroJson()
              : zeroBoolean();

      const schemaValueWithFrom =
        resolvedColumnName !== key
          ? schemaValue.from(resolvedColumnName)
          : schemaValue;

      return {
        ...acc,
        [key]: isColumnOptional
          ? schemaValueWithFrom.optional()
          : schemaValueWithFrom,
      };
    },
    {} as Record<string, any>,
  );

  if (primaryKeys.size === 0) {
    throw new Error(
      `drizzle-zero: No primary keys found in table - ${actualTableName}. Did you forget to define a primary key?`,
    );
  }

  const resolvedTableName = tableConfig.schema
    ? `${tableConfig.schema}.${actualTableName}`
    : actualTableName;

  const zeroBuilder = zeroTable(tableName);

  const zeroBuilderWithFrom =
    resolvedTableName !== tableName
      ? zeroBuilder.from(resolvedTableName)
      : zeroBuilder;

  return zeroBuilderWithFrom
    .columns(columnsMapped)
    .primaryKey(...primaryKeys) as ZeroTableBuilder<
    TTableName,
    TTable,
    TColumnConfig
  >;
};

/**
 * Get the key of a column in the schema from the column name.
 * @param columnName - The name of the column to get the key for
 * @param table - The table to get the column key from
 * @returns The key of the column in the schema
 */
const getDrizzleColumnKeyFromColumnName = ({
  columnName,
  table,
}: {
  columnName: string;
  table: Table;
}) => {
  const tableColumns = getColumns(table);

  return typedEntries(tableColumns).find(
    ([_name, column]) => column.name === columnName,
  )?.[0]!;
};

export {
  createZeroTableBuilder,
  getDrizzleColumnKeyFromColumnName,
  type ZeroTableBuilder,
};
