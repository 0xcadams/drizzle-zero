import type { Schema, TableSchema, relationships } from "@rocicorp/zero";
import { expect } from "vitest";

export type ZeroSchema = Schema;

export function expectTableSchemaDeepEqual(actual: TableSchema) {
  return {
    toEqual(expected: TableSchema) {
      expect({
        __testKey: "tableColumns",
        keys: Object.keys(actual.columns ?? {}),
      }).toStrictEqual({
        __testKey: "tableColumns",
        keys: Object.keys(expected.columns ?? {}),
      });

      for (const key of Object.keys(actual.columns ?? {})) {
        expect({
          ...(actual.columns[key as keyof typeof actual.columns] as object),
          __testKey: key,
        }).toStrictEqual({
          ...(expected.columns[key as keyof typeof expected.columns] as object),
          __testKey: key,
        });
      }

      expect({
        __testKey: "primaryKey",
        primaryKey: actual.primaryKey,
      }).toStrictEqual({
        __testKey: "primaryKey",
        primaryKey: expected.primaryKey,
      });
      expect({
        __testKey: "tableName",
        tableName: actual.name,
      }).toStrictEqual({
        __testKey: "tableName",
        tableName: expected.name,
      });
      expect({
        __testKey: "serverName",
        serverName: actual?.serverName,
      }).toStrictEqual({
        __testKey: "serverName",
        serverName: expected?.serverName,
      });
    },
  };
}

type RelationshipsSchema = {
  [key: string]: ReturnType<typeof relationships>["relationships"][string];
};

export function expectRelationsSchemaDeepEqual<S extends RelationshipsSchema>(
  actual: S,
) {
  return {
    toEqual(expected: S) {
      if (expected) {
        for (const key of Object.keys(expected)) {
          expect(Array.isArray(expected[key])).toBe(true);
          expect(Array.isArray(actual[key])).toBe(true);

          const expectedRelations = expected[key];

          const actualRelations = actual[key];

          if (!expectedRelations || !actualRelations) {
            throw new Error("Expected or actual relations are not defined");
          }

          expect(actualRelations).toHaveLength(expectedRelations.length);

          for (let i = 0; i < expectedRelations.length; i++) {
            expect({
              __testKey: "expectedRelations",
              key,
              sourceField: actualRelations[i],
            }).toStrictEqual({
              __testKey: "expectedRelations",
              key,
              sourceField: expectedRelations[i],
            });
          }
        }
      }
    },
  };
}

export function expectSchemaDeepEqual(actual: ZeroSchema) {
  return {
    toEqual(expected: ZeroSchema) {
      expect({
        __testKey: "tables",
        keys: Object.keys(actual.tables),
      }).toStrictEqual({
        __testKey: "tables",
        keys: Object.keys(expected.tables),
      });

      expect({
        __testKey: "relationships",
        keys: Object.keys(actual.relationships || {}),
      }).toStrictEqual({
        __testKey: "relationships",
        keys: Object.keys(expected.relationships || {}),
      });

      for (const key of Object.keys(actual.tables)) {
        expectTableSchemaDeepEqual(
          actual.tables[key as keyof typeof actual.tables]!,
        ).toEqual(expected.tables[key as keyof typeof expected.tables]!);
      }

      for (const key of Object.keys(actual.relationships || {})) {
        expectRelationsSchemaDeepEqual(
          actual.relationships[key as keyof typeof actual.relationships]!,
        ).toEqual(
          expected.relationships[key as keyof typeof expected.relationships]!,
        );
      }
    },
  };
}

// Give "any" its own class
export class Any {
  // @ts-ignore
  private _: true;
}

// Conditional returns can enforce identical types.
// See here: https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-421529650
// prettier-ignore
// type TestExact<Left, Right> =
//   (<U>() => U extends Left ? 1 : 0) extends (<U>() => U extends Right ? 1 : 0) ? Any : never;

type IsAny<T> = Any extends T ? ([T] extends [Any] ? 1 : 0) : 0;

export type Test<Left, Right> =
  IsAny<Left> extends 1
    ? IsAny<Right> extends 1
      ? 1
      : "❌ Left type is 'any' but right type is not"
    : IsAny<Right> extends 1
      ? "❌ Right type is 'any' but left type is not"
      : [Left] extends [Right]
        ? [Right] extends [Left]
          ? 1
          : // Any extends TestExact<Left, Right>
            //   ? 1
            //   : "❌ Unexpected or missing 'readonly' property"
            "❌ Right type is not assignable to left type"
        : "❌ Left type is not assignable to right type";

type Assert<T, U> = U extends 1
  ? T // No error.
  : IsAny<T> extends 1
    ? never // Ensure "any" is refused.
    : U; // Return the error message.

/**
 * Raise a compiler error when both argument types are not identical.
 */
export const assertEqual = <Left, Right>(
  _left: Assert<Left, Test<Left, Right>>,
  _right: Assert<Right, Test<Left, Right>>,
): Right => {
  return null as Right;
};
