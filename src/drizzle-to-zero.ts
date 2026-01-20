import type {ReadonlyJSONValue} from '@rocicorp/zero';

/**
 * Represents the basic data types supported by Drizzle ORM (pre-1.0).
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
 * Drizzle 1.0 base data types.
 * In 1.0, dataType can be compound like "string uuid" or "number int32".
 */
type Drizzle1BaseDataType =
  | 'array'
  | 'bigint'
  | 'boolean'
  | 'custom'
  | 'number'
  | 'object'
  | 'string';

/**
 * Drizzle 1.0 constraint types that modify the base type.
 */
type Drizzle1ObjectConstraint =
  | 'buffer'
  | 'date'
  | 'geometry'
  | 'json'
  | 'line'
  | 'point'
  | 'dateDuration'
  | 'duration'
  | 'localDate'
  | 'localDateTime'
  | 'localTime'
  | 'relDuration';

/**
 * Maps Drizzle 1.0 base data types to Zero types.
 * Special cases like "object date" need constraint-aware handling.
 */
export const drizzle1BaseTypeToZeroType = {
  string: 'string',
  number: 'number',
  bigint: 'number',
  boolean: 'boolean',
  object: 'json', // default for object, but "object date" → number
  array: 'json',
  custom: 'json', // custom types default to json
} as const satisfies Record<Exclude<Drizzle1BaseDataType, never>, string>;

export type Drizzle1BaseTypeToZeroType = typeof drizzle1BaseTypeToZeroType;

/**
 * Helper type to extract the base type from a Drizzle 1.0 compound dataType.
 * e.g., "string uuid" → "string", "number int32" → "number"
 */
export type ExtractBaseType<T extends string> = T extends `${infer Base} ${string}`
  ? Base
  : T;

/**
 * Helper type to extract the constraint from a Drizzle 1.0 compound dataType.
 * e.g., "string uuid" → "uuid", "object date" → "date"
 */
export type ExtractConstraint<T extends string> = T extends `${string} ${infer Constraint}`
  ? Constraint
  : undefined;

/**
 * Maps a Drizzle 1.0 dataType to a Zero type, handling compound types.
 * Special handling for:
 * - "object date" → 'number' (timestamps)
 * - "object json" → 'json'
 * - other object types → 'json'
 */
export type MapDrizzle1DataTypeToZero<T extends string> =
  // Handle "object date" specially - dates are numbers in Zero
  T extends `object ${infer Constraint extends Drizzle1ObjectConstraint}`
    ? Constraint extends 'date' | 'localDate' | 'localDateTime' | 'localTime'
      ? 'number'
      : 'json'
    // For all other types, extract base and map
    : ExtractBaseType<T> extends keyof Drizzle1BaseTypeToZeroType
      ? Drizzle1BaseTypeToZeroType[ExtractBaseType<T>]
      // Fallback for unknown types
      : 'json';

/**
 * Type predicate to check if a Drizzle 1.0 dataType represents a timestamp/date type.
 * These types have various `data` types in Drizzle (Date, string), but Zero stores them as `number` (milliseconds).
 *
 * Covers:
 * - 'object date' (timestamp with mode: 'date', date with mode: 'date')
 * - 'object localDate/localDateTime/localTime' (other date types)
 * - 'string timestamp' (timestamp with mode: 'string')
 * - 'string date' (date with default mode or mode: 'string')
 */
export type IsTimestampDataType<T extends string> =
  T extends `object ${infer Constraint}`
    ? Constraint extends 'date' | 'localDate' | 'localDateTime' | 'localTime'
      ? true
      : false
    : T extends `string ${infer Constraint}`
      ? Constraint extends 'timestamp' | 'date'
        ? true
        : false
      : false;

/**
 * Type predicate to check if a Drizzle 1.0 dataType represents a bigint type with mode: 'bigint'.
 * These have `data: bigint` in Drizzle, but Zero stores them as `number`.
 */
export type IsBigIntDataType<T extends string> =
  T extends `bigint ${string}` ? true : false;

/**
 * Type predicate to check if a Drizzle 1.0 dataType represents a numeric type with string mode.
 * These have `data: string` in Drizzle (e.g., "125.50"), but Zero stores them as `number`.
 * Covers: numeric(), decimal() without mode: 'number'
 */
export type IsStringNumericDataType<T extends string> =
  T extends `string ${infer Constraint}`
    ? Constraint extends 'numeric'
      ? true
      : false
    : false;

/**
 * Check if a type is exactly equal to another type (not a branded subtype).
 * Used to distinguish between default types and $type<T>() overrides.
 */
export type IsExactType<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;

/**
 * Represents specific Postgres column types supported by Zero.
 * These are the columnType values from Drizzle 0.x (pre-1.0).
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
 * NOTE: In Drizzle 1.0, columnType is not in the `_` type, so this is for backwards compat.
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
 * Used as runtime fallback via getSQLType().
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

/**
 * Runtime helper to extract base type from Drizzle 1.0 compound dataType.
 */
export function extractBaseType(dataType: string): string {
  const spaceIndex = dataType.indexOf(' ');
  return spaceIndex === -1 ? dataType : dataType.slice(0, spaceIndex);
}

/**
 * Runtime helper to extract constraint from Drizzle 1.0 compound dataType.
 */
export function extractConstraint(dataType: string): string | undefined {
  const spaceIndex = dataType.indexOf(' ');
  return spaceIndex === -1 ? undefined : dataType.slice(spaceIndex + 1);
}

/**
 * Runtime mapping for Drizzle 1.0 base types to Zero types.
 */
export function mapDrizzle1DataTypeToZero(dataType: string): string | null {
  const baseType = extractBaseType(dataType);
  const constraint = extractConstraint(dataType);

  // Special handling for object types
  if (baseType === 'object') {
    // Date types should be numbers in Zero
    if (
      constraint === 'date' ||
      constraint === 'localDate' ||
      constraint === 'localDateTime' ||
      constraint === 'localTime'
    ) {
      return 'number';
    }
    // All other object types (json, buffer, etc.) are json
    return 'json';
  }

  // Map other base types
  // Note: 'custom' is NOT mapped here so it falls through to getSQLType()
  const mapping: Record<string, string> = {
    string: 'string',
    number: 'number',
    bigint: 'number',
    boolean: 'boolean',
    array: 'json',
  };

  return mapping[baseType] ?? null;
}
