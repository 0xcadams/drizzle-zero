import type {ReadonlyJSONValue} from '@rocicorp/zero';

/**
 * Represents the basic data types supported by Drizzle ORM.
 * These are the fundamental types that can be used in table column definitions.
 */
type DrizzleDataType = 'number' | 'bigint' | 'boolean' | 'date';

/**
 * Maps Drizzle data types to their corresponding Zero schema types.
 * This is a constant mapping that ensures type safety when converting between the two systems.
 */
export const drizzleDataTypeToZeroType = {
  number: 'number',
  bigint: 'number',
  boolean: 'boolean',
  date: 'number',
} as const satisfies Record<DrizzleDataType, string>;

/**
 * Type representation of the Drizzle to Zero type mapping.
 * Extracts the type information from the drizzleDataTypeToZeroType constant.
 */
export type DrizzleDataTypeToZeroType = typeof drizzleDataTypeToZeroType;

/**
 * Represents specific Postgres column types supported by Zero.
 */
type DrizzleColumnType =
  | 'PgText'
  | 'PgChar'
  | 'PgVarchar'
  | 'PgUUID'
  | 'PgEnumColumn'
  | 'PgJsonb'
  | 'PgJson'
  | 'PgNumeric'
  | 'PgDateString'
  | 'PgTimestampString'
  | 'PgArray';

/**
 * Maps Postgres-specific Drizzle column types to their corresponding Zero schema types.
 * Handles special cases where Postgres types need specific Zero type representations.
 */
export const drizzleColumnTypeToZeroType = {
  PgText: 'string',
  PgChar: 'string',
  PgVarchar: 'string',
  PgUUID: 'string',
  PgEnumColumn: 'string',
  PgJsonb: 'json',
  PgJson: 'json',
  PgNumeric: 'number',
  PgDateString: 'number',
  PgTimestampString: 'number',
  PgArray: 'json',
} as const satisfies Record<DrizzleColumnType, string>;

/**
 * Type representation of the Postgres-specific Drizzle to Zero type mapping.
 * Extracts the type information from the drizzleColumnTypeToZeroType constant.
 */
export type DrizzleColumnTypeToZeroType = typeof drizzleColumnTypeToZeroType;

/**
 * Maps PostgreSQL SQL type names to their corresponding Zero schema types.
 */
export const postgresTypeToZeroType = {
  // string-like
  'text': 'string',
  'char': 'string',
  'character': 'string',
  'varchar': 'string',
  'character varying': 'string',
  'uuid': 'string',
  'enum': 'string', // enums are emitted via zero.enumeration([...]) and are strings

  // json-like
  'jsonb': 'json',
  'json': 'json',

  // number-like (all numeric types)
  'numeric': 'number',
  'decimal': 'number',
  'int': 'number',
  'integer': 'number',
  'smallint': 'number',
  'bigint': 'number',
  'int2': 'number',
  'int4': 'number',
  'int8': 'number',
  'real': 'number',
  'float4': 'number',
  'float8': 'number',
  'double precision': 'number',
  'serial': 'number',
  'bigserial': 'number',

  // date/time mapped to number (epoch millis)
  'date': 'number',
  'timestamp': 'number',
  'timestamp without time zone': 'number',
  'timestamp with time zone': 'number',
  'timestamptz': 'number',

  // boolean
  'boolean': 'boolean',
  'bool': 'boolean',
} as const satisfies Record<string, string>;

/**
 * Type representation of the Postgres-specific Drizzle to Zero type mapping.
 * Extracts the type information from the postgresTypeToZeroType constant.
 */
export type PostgresTypeToZeroType = typeof postgresTypeToZeroType;

/**
 * Maps Zero schema types to their corresponding TypeScript types.
 */
export type ZeroTypeToTypescriptType = {
  number: number;
  boolean: boolean;
  date: string;
  string: string;
  json: ReadonlyJSONValue;
};
