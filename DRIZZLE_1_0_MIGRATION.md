# Drizzle 1.0 Migration Guide

## Objective

Update drizzle-zero to fully support Drizzle ORM 1.0, which introduced significant internal refactoring. The goal is to maintain full type safety and ensure all existing tests pass.

## Current State

- **Branch**: `drizzle-1.0` (based on `upstream/0xcadams/drizzle-beta`)
- **Drizzle Version**: `^1.0.0-beta.10`
- **Status**: ✅ **COMPLETE** - All 625 tests passing, 0 type errors

---

## Summary of Changes

### Type System Fixes

#### 1. Timestamp/Date Type Mapping
**Files**: `src/drizzle-to-zero.ts`, `src/relations.ts`, `src/tables.ts`

Zero stores all timestamps as `number` (milliseconds). Added type predicates to properly convert:
- `IsTimestampDataType<T>` - Detects `object date`, `object localDate/DateTime/Time`, `string timestamp`, `string date`
- `IsBigIntDataType<T>` - Detects `bigint int64` (for `mode: 'bigint'`)
- `IsStringNumericDataType<T>` - Detects `string numeric` (for default numeric mode)
- `IsExactType<T, U>` - Distinguishes default types from `$type<T>()` overrides

**Key insight**: Must preserve `$type<T>()` overrides (e.g., `timestamp().$type<ISODateString>()` keeps `ISODateString`), while converting defaults to `number`.

#### 2. ReadonlyJSONValue Preservation
**File**: `src/cli/type-resolution.ts`

Changed type resolution to use `UseAliasDefinedOutsideCurrentScope` flag first, which preserves known type aliases like `ReadonlyJSONValue`. Falls back to `InTypeAlias` for expanding custom interface types.

#### 3. Custom Column Type Runtime Mapping
**File**: `src/drizzle-to-zero.ts`

Removed `custom: 'json'` from the runtime mapping so custom types fall through to `getSQLType()`, allowing proper mapping (e.g., custom `integer` type → `number`).

### API Changes

#### 4. Drizzle 1.0 Query Builder
**File**: `db/test-utils.ts`

Drizzle 1.0 requires `relations` passed separately:
```typescript
// Drizzle 1.0 with defineRelations
const db = drizzle({ client, schema: tables, relations });
```

#### 5. Where Clause Syntax
**Files**: `integration/tests/integration.test.ts`, `no-config-integration/tests/integration.test.ts`

Changed to object-based filters:
```typescript
// Before: where: (table, {eq}) => eq(table.id, '123')
// After:
db.query.users.findFirst({ where: { id: '123' } });
```

### Test Updates

#### 6. Previously Unsupported Types Now Supported

In Drizzle 1.0, these types have valid compound dataTypes:
- `interval`, `cidr`, `macaddr`, `inet` → `'string <constraint>'` → `string`
- `point`, `line` → `'array <constraint>'` → `json`
- `geometry` → `'object <constraint>'` → `json`

Updated tests to verify correct schema generation instead of expecting warnings.

---

## Key Findings: Drizzle 1.0 Internal Changes

### 1. Column `_` Structure Changed

**Drizzle 0.x:**
```typescript
column._ = {
  columnType: 'PgUUID',      // e.g., 'PgText', 'PgInteger'
  dataType: 'string',        // e.g., 'string', 'number'
  data: string,              // TypeScript type
  $type: T,                  // When using $type<T>()
}
```

**Drizzle 1.0:**
```typescript
column._ = {
  dataType: 'string uuid',   // COMPOUND format: "baseType constraint"
  data: string,              // TypeScript type (set by $type<T>())
}
column.columnType = 'PgUUID'  // Direct property (not in _)
```

### 2. DataType Format (Compound Types)

| Drizzle 0.x | Drizzle 1.0 | Zero Type |
|-------------|-------------|-----------|
| `'string'` | `'string'` or `'string uuid'` | `string` |
| `'number'` | `'number'` or `'number int32'` | `number` |
| `'boolean'` | `'boolean'` | `boolean` |
| `'date'` | `'object date'` | `number` |
| N/A | `'string timestamp'` | `number` |
| N/A | `'string date'` | `number` |
| N/A | `'string numeric'` | `number` |
| N/A | `'string interval'` | `string` |
| N/A | `'bigint int64'` | `number` |
| N/A | `'object json'` | `json` |
| N/A | `'array point'` | `json` |
| N/A | `'custom'` | fallback to getSQLType() |

### 3. `$type<T>()` Behavior

**Drizzle 0.x:** `column._ = { $type: T, data: unknown, ... }`
**Drizzle 1.0:** `column._ = { data: T, ... }` (no `$type`, `data` is set directly)

---

## Type Mapping Logic

### CustomType / ZeroMappedCustomType Decision Tree

```
1. Check for Drizzle 0.x $type override → use $type
2. Check for Drizzle 0.x PgCustomColumn → use data
3. Check for Drizzle 0.x PgEnumColumn → use data
4. Check for Drizzle 0.x PgText with string literal → use data
5. Check for Drizzle 0.x PgArray → use data
6. Check for Drizzle 1.0 dataType:
   a. IsTimestampDataType?
      - If data is exactly Date or string (default) → number
      - If data is branded/custom type ($type override) → preserve data
   b. IsBigIntDataType?
      - If data is exactly bigint (default) → number
      - If data is branded/custom type → preserve data
   c. IsStringNumericDataType?
      - If data is exactly string (default) → number
      - If data is branded/custom type → preserve data
   d. Otherwise:
      - If data is unknown → use DefaultColumnType
      - If data is known → use data
7. Fallback → DefaultColumnType
```

---

## Files Modified

| File | Changes |
|------|---------|
| `src/drizzle-to-zero.ts` | Type predicates, runtime mapping fixes |
| `src/relations.ts` | `CustomType` updated for Drizzle 1.0 |
| `src/tables.ts` | `ZeroMappedCustomType` updated for Drizzle 1.0 |
| `src/cli/type-resolution.ts` | Two-phase type resolution (preserve aliases first) |
| `db/test-utils.ts` | Added `relations` to drizzle() config |
| `integration/tests/integration.test.ts` | Where clause syntax |
| `no-config-integration/tests/integration.test.ts` | Where clause syntax |
| `tests/tables.test.ts` | Updated tests for now-supported types |
| `tests/type-resolution.test.ts` | Updated snapshots, fixed edge cases |

---

## Commands

```bash
# Build
pnpm build

# Run all tests
pnpm test

# Type check only
pnpm check-types

# Run specific test file
pnpm vitest run tests/tables.test.ts
```

---

## Reference: Zero's Value Types

```typescript
type ValueType = 'string' | 'number' | 'boolean' | 'null' | 'json';
```

All timestamps are stored as `number` (milliseconds since epoch).
