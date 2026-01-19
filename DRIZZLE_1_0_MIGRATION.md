# Drizzle 1.0 Migration Guide

## Objective

Update drizzle-zero to fully support Drizzle ORM 1.0, which introduced significant internal refactoring. The goal is to maintain full type safety and ensure all existing tests pass.

## Current State

- **Branch**: `drizzle-1.0` (based on `upstream/0xcadams/drizzle-beta`)
- **Drizzle Version**: `^1.0.0-beta.10` (beta.11 has broken TypeScript types)
- **Status**: 🟡 In Progress
- **Tests**: 629/633 passing (4 failing array type tests - pre-existing)

### Remaining Issues

**Array type tests (4 failures)**: Pre-existing issue in drizzle-1.0 branch. Array type mapping produces incorrect nesting:
- `jsonb().array().$type<{id: string; name: string}[]>()` produces `{id: string; name: string}[][]` instead of `{id: string; name: string}[]`
- `integer().array().array()` produces `number[]` instead of `number[][]`

**Note on beta.11**: Drizzle ORM 1.0.0-beta.11 has numerous TypeScript type errors in its own declaration files (missing `config` property, `getSQL` not implemented, etc.). Staying on beta.10 until fixed.

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

#### 4. User-Defined $type<T>() Preservation in CLI (NEW)
**File**: `src/cli/type-resolution.ts`

**Problem**: When users use `jsonb().$type<RecordData>()`, the custom type `RecordData` was being rejected by `isSafeResolvedType()` because it wasn't in the allowlist of primitive types.

**Root cause**: The original `isSafeResolvedType` used an ALLOWLIST approach, only accepting primitives and specific known types. User-defined type aliases like `RecordData` were rejected.

**Solution**: Changed to BLOCKLIST approach. Now `isSafeResolvedType` only rejects:
- Unresolved helper types: `CustomType<...>`, `ZeroCustomType<...>`
- Error indicators: `__error__`, `SchemaIsAnyError`
- Unresolved imports: `import("...")`

**Philosophy change**: Trust user's type choices. If they use `$type<MyType>()`, that's what they want in the generated schema. We don't validate JSON-serializability - that's the user's responsibility.

**Test**: New test added `preserves user-defined $type<T>() on jsonb columns` verifies this works.

### API Changes

#### 5. Drizzle 1.0 Query Builder
**File**: `db/test-utils.ts`

Drizzle 1.0 requires `relations` passed separately:
```typescript
// Drizzle 1.0 with defineRelations
const db = drizzle({ client, schema: tables, relations });
```

#### 6. Where Clause Syntax
**Files**: `integration/tests/integration.test.ts`, `no-config-integration/tests/integration.test.ts`

Changed to object-based filters:
```typescript
// Before: where: (table, {eq}) => eq(table.id, '123')
// After:
db.query.users.findFirst({ where: { id: '123' } });
```

### Test Updates

#### 7. Previously Unsupported Types Now Supported

In Drizzle 1.0, these types have valid compound dataTypes:
- `interval`, `cidr`, `macaddr`, `inet` → `'string <constraint>'` → `string`
- `point`, `line` → `'array <constraint>'` → `json`
- `geometry` → `'object <constraint>'` → `json`

Updated tests to verify correct schema generation instead of expecting warnings.

#### 8. Simplified isSafeResolvedType Tests

Rewrote `tests/type-resolution.test.ts` to match new blocklist philosophy:
- Removed 400+ lines of allowlist-based tests
- Added focused tests for the blocklist approach
- Added test for user-defined `$type<T>()` preservation

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

## Type Resolution Philosophy

### Old Approach (Allowlist)
```
isSafeResolvedType checks if type is in allowed list:
- Primitives: string, number, boolean, null, undefined
- Known safe: ReadonlyJSONValue
- Reject everything else (including user types!)
```

### New Approach (Blocklist)
```
isSafeResolvedType only rejects known problematic patterns:
- CustomType<...>, ZeroCustomType<...> (unresolved helpers)
- import("...") (unresolved paths)
- __error__, SchemaIsAnyError (error indicators)
- Accept everything else (trust user's $type<T>() choices)
```

**Rationale**: When a user explicitly uses `$type<RecordData>()`, they're telling us "this is the type I want". We should trust that choice and emit it to the generated schema. Validating JSON-serializability is beyond our scope.

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
| `src/cli/type-resolution.ts` | Blocklist approach, removed string literal scanning |
| `db/test-utils.ts` | Added `relations` to drizzle() config |
| `integration/tests/integration.test.ts` | Where clause syntax |
| `no-config-integration/tests/integration.test.ts` | Where clause syntax |
| `tests/tables.test.ts` | Updated tests for now-supported types |
| `tests/type-resolution.test.ts` | Simplified to blocklist philosophy |
| `tests/drizzle-1.0.test.ts` | New tests for compound dataType utilities |
| `tests/types.test.ts` | Type-level tests for Drizzle 1.0 mappings |

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

# Regenerate integration schemas
cd integration && pnpm generate
cd no-config-integration && pnpm generate
```

---

## Reference: Zero's Value Types

```typescript
type ValueType = 'string' | 'number' | 'boolean' | 'null' | 'json';
```

All timestamps are stored as `number` (milliseconds since epoch).

---

## Open Questions

1. **Backwards compatibility**: The changes support both Drizzle 0.x and 1.0 column structures. Should we drop 0.x support?

2. **Type validation**: With the blocklist approach, we trust user's `$type<T>()` choices. Should we add optional validation for JSON-serializability?

3. **PR Status**: Draft PR #234 open against `0xcadams/drizzle-beta` branch.
