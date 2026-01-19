/**
 * Tests for Drizzle 1.0 compound dataType utilities.
 * Runtime type mapping is already covered by tables.test.ts.
 */
import {describe, expect, test} from 'vitest';
import {
  extractBaseType,
  mapDrizzle1DataTypeToZero,
} from '../src/drizzle-to-zero';

describe('Drizzle 1.0 compound dataType utilities', () => {
  test('extractBaseType parses compound dataTypes', () => {
    // Simple types
    expect(extractBaseType('string')).toBe('string');
    expect(extractBaseType('number')).toBe('number');
    expect(extractBaseType('boolean')).toBe('boolean');
    expect(extractBaseType('custom')).toBe('custom');

    // Compound types (base + constraint)
    expect(extractBaseType('string uuid')).toBe('string');
    expect(extractBaseType('string timestamp')).toBe('string');
    expect(extractBaseType('number int32')).toBe('number');
    expect(extractBaseType('bigint int64')).toBe('bigint');
    expect(extractBaseType('object date')).toBe('object');
    expect(extractBaseType('array point')).toBe('array');
  });

  test('mapDrizzle1DataTypeToZero maps to Zero types', () => {
    // String-based → string
    expect(mapDrizzle1DataTypeToZero('string')).toBe('string');
    expect(mapDrizzle1DataTypeToZero('string uuid')).toBe('string');
    expect(mapDrizzle1DataTypeToZero('string interval')).toBe('string');

    // Number-based → number
    expect(mapDrizzle1DataTypeToZero('number')).toBe('number');
    expect(mapDrizzle1DataTypeToZero('number int32')).toBe('number');
    expect(mapDrizzle1DataTypeToZero('bigint int64')).toBe('number');

    // Boolean → boolean
    expect(mapDrizzle1DataTypeToZero('boolean')).toBe('boolean');

    // Object/array → json (except date objects → number)
    expect(mapDrizzle1DataTypeToZero('object json')).toBe('json');
    expect(mapDrizzle1DataTypeToZero('object date')).toBe('number');
    expect(mapDrizzle1DataTypeToZero('array point')).toBe('json');

    // Custom/unknown → null (falls through to getSQLType)
    expect(mapDrizzle1DataTypeToZero('custom')).toBe(null);
    expect(mapDrizzle1DataTypeToZero('unknown_type')).toBe(null);
  });
});
