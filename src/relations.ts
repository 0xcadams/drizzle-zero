import { createSchema } from "@rocicorp/zero";
import {
  createTableRelationsHelpers,
  getTableName,
  getTableUniqueName,
  is,
  Many,
  One,
  Relations,
  Table,
} from "drizzle-orm";
import type {
  DrizzleColumnTypeToZeroType,
  DrizzleDataTypeToZeroType,
  ZeroTypeToTypescriptType,
} from "./drizzle-to-zero";
import {
  createZeroTableBuilder,
  getDrizzleColumnKeyFromColumnName,
  type ZeroTableBuilderSchema,
  type ZeroTableCasing,
} from "./tables";
import type {
  ColumnIndexKeys,
  DefaultTableColumnsConfig,
  FindTableByName,
  Flatten,
  TableColumnsConfig,
} from "./types";
import { debugLog, typedEntries } from "./util";

type IsAny<T> = 0 extends 1 & T ? true : false;

type SchemaIsAnyError = {
  __error__: "The schema passed in to `ZeroCustomType` is `any`. Please make sure to pass in a proper schema type, or check your imports to make sure that Typescript can resolve your schema definition.";
};

/**
 * Maps a column definition to its Zero type (string, number, boolean, json).
 */
type DirectZeroType<CD> = CD extends {
  columnType: keyof DrizzleColumnTypeToZeroType;
}
  ? DrizzleColumnTypeToZeroType[CD["columnType"]]
  : CD extends { dataType: keyof DrizzleDataTypeToZeroType }
    ? DrizzleDataTypeToZeroType[CD["dataType"]]
    : never;

/**
 * Maps column types to their default TypeScript types when no custom type is specified.
 */
type DefaultColumnType<CD> =
  DirectZeroType<CD> extends keyof ZeroTypeToTypescriptType
    ? ZeroTypeToTypescriptType[DirectZeroType<CD>]
    : unknown;

/**
 * Direct extraction of the custom type from Drizzle schema. This falls back
 * to the default TypeScript type if no custom type is specified.
 *
 * @template DrizzleSchema - The Drizzle schema object (typeof drizzleSchema)
 * @template TableKey - The key of the table in the schema
 * @template ColumnKey - The key of the column in the table
 */
type CustomType<
  DrizzleSchema,
  TableKey extends string,
  ColumnKey extends string,
> = TableKey extends keyof DrizzleSchema
  ? DrizzleSchema[TableKey] extends Table
    ? ColumnKey extends keyof DrizzleSchema[TableKey]
      ? DrizzleSchema[TableKey][ColumnKey] extends { _: infer CD }
        ? CD extends { columnType: "PgCustomColumn"; data: infer TData }
          ? TData
          : CD extends { columnType: "PgEnumColumn"; data: infer TData }
            ? TData
            : CD extends { columnType: "PgText"; data: infer TData }
              ? TData extends string
                ? TData
                : string
              : CD extends { columnType: "PgArray"; data: infer TArrayData }
                ? TArrayData
                : CD extends { $type: infer TType }
                  ? TType
                  : DefaultColumnType<CD>
        : unknown
      : unknown
    : unknown
  : unknown;

/**
 * Type utility to get the Drizzle custom type for a table and column.
 *
 * @template ZeroSchema - The complete Zero schema
 * @template TableName - The name of the table
 * @template ColumnName - The name of the column
 */
type ZeroCustomType<
  ZeroSchema,
  TableName extends string,
  ColumnName extends string,
> =
  // if the whole schema is `any`, surface our error
  IsAny<ZeroSchema> extends true
    ? SchemaIsAnyError
    : // otherwise, do your usual pattern match
      ZeroSchema extends {
          tables: Record<
            TableName,
            { columns: Record<ColumnName, { customType: infer T }> }
          >;
        }
      ? T
      : unknown;

/**
 * Configuration type for many-to-many relationships for a specific table.
 * @template TDrizzleSchema - The complete Drizzle schema
 * @template TSourceTableName - The name of the source table
 */
type ManyTableConfig<
  TDrizzleSchema extends Record<string, unknown>,
  TSourceTableName extends keyof TDrizzleSchema & string,
> = {
  readonly [TRelationName: string]:
    | readonly [keyof TDrizzleSchema, keyof TDrizzleSchema]
    | {
        [K in keyof TDrizzleSchema]: {
          [L in keyof TDrizzleSchema]: readonly [
            {
              readonly destTable: K;
              readonly sourceField: ColumnIndexKeys<
                FindTableByName<TDrizzleSchema, TSourceTableName & string>
              >[];
              readonly destField: ColumnIndexKeys<
                FindTableByName<TDrizzleSchema, K & string>
              >[];
            },
            {
              readonly destTable: L;
              readonly sourceField: ColumnIndexKeys<
                FindTableByName<TDrizzleSchema, K & string>
              >[];
              readonly destField: ColumnIndexKeys<
                FindTableByName<TDrizzleSchema, L & string>
              >[];
            },
          ];
        }[keyof TDrizzleSchema];
      }[keyof TDrizzleSchema];
};

/**
 * Configuration for many-to-many relationships across all tables.
 * Organized by source table, with each relationship specifying a tuple of [junction table name, destination table name].
 * The junction table and destination table must be different from the source table and each other.
 */
type ManyConfig<TDrizzleSchema extends Record<string, unknown>> = {
  readonly [TSourceTableName in keyof TDrizzleSchema &
    string]?: ManyTableConfig<TDrizzleSchema, TSourceTableName>;
};

/**
 * The mapped Zero schema from a Drizzle schema with version and tables.
 */
type DrizzleToZeroSchema<
  TDrizzleSchema extends { [K in string]: unknown },
  TColumnConfig extends
    TableColumnsConfig<TDrizzleSchema> = DefaultTableColumnsConfig<TDrizzleSchema>,
> = {
  readonly tables: {
    readonly [K in keyof TDrizzleSchema as TDrizzleSchema[K] extends Table<any>
      ? K
      : never]: TDrizzleSchema[K] extends Table<any>
      ? ZeroTableBuilderSchema<
          K & string,
          TDrizzleSchema[K],
          TColumnConfig[K & keyof TColumnConfig]
        >
      : never;
  };
  readonly relationships: any;
  readonly enableLegacyMutators?: boolean;
  readonly enableLegacyQueries?: boolean;
};

/**
 * Configuration for the Zero schema generator. This defines how your Drizzle ORM schema
 * is transformed into a Zero schema format, handling both direct relationships and many-to-many relationships.
 *
 * This allows you to:
 * - Select which tables to include in the Zero schema
 * - Configure column types and transformations
 * - Define many-to-many relationships through junction tables
 *
 * @param schema - The Drizzle schema to create a Zero schema from. This should be your complete Drizzle schema object
 *                containing all your table definitions and relationships.
 * @param config - Configuration object for the Zero schema generation
 * @param config.tables - Specify which tables and columns to include in sync
 * @param config.manyToMany - Optional configuration for many-to-many relationships through junction tables
 * @param config.casing - The casing to use for the table name.
 * @param config.debug - Whether to enable debug mode.
 *
 * @returns A configuration object for the Zero schema CLI.
 *
 * @example
 * ```typescript
 * import { integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
 * import { relations } from 'drizzle-orm';
 * import { drizzleZeroConfig } from 'zero-drizzle';
 *
 * // Define Drizzle schema
 * const users = pgTable('users', {
 *   id: serial('id').primaryKey(),
 *   name: text('name'),
 * });
 *
 * const posts = pgTable('posts', {
 *   id: serial('id').primaryKey(),
 *   title: varchar('title'),
 *   authorId: integer('author_id').references(() => users.id),
 * });
 *
 * const usersRelations = relations(users, ({ one }) => ({
 *   posts: one(posts, {
 *     fields: [users.id],
 *     references: [posts.authorId],
 *   }),
 * }));
 *
 * // Export the configuration for the Zero schema CLI
 * export default drizzleZeroConfig(
 *   { users, posts, usersRelations },
 *   {
 *     tables: {
 *       users: {
 *         id: true,
 *         name: true,
 *       },
 *       posts: {
 *         id: true,
 *         title: true,
 *         authorId: true,
 *       },
 *     },
 *   }
 * );
 * ```
 */
const drizzleZeroConfig = <
  const TDrizzleSchema extends { [K in string]: unknown },
  const TColumnConfig extends
    TableColumnsConfig<TDrizzleSchema> = DefaultTableColumnsConfig<TDrizzleSchema>,
  const TManyConfig extends ManyConfig<TDrizzleSchema> | undefined = undefined,
  const TCasing extends ZeroTableCasing = undefined,
>(
  /**
   * The Drizzle schema to create a Zero schema from.
   */
  schema: TDrizzleSchema,

  /**
   * The configuration for the Zero schema.
   *
   * @param config.tables - The tables to include in the Zero schema.
   * @param config.many - Configuration for many-to-many relationships.
   */
  config?: {
    /**
     * Specify the tables to include in the Zero schema.
     * This can include type overrides for columns, using `column.json()` for example.
     *
     * @example
     * ```ts
     * {
     *   user: {
     *     id: true,
     *     name: true,
     *   },
     *   profile_info: {
     *     id: true,
     *     user_id: true,
     *     metadata: column.json(),
     *   },
     * }
     * ```
     */
    readonly tables?: TColumnConfig;

    /**
     * Configuration for many-to-many relationships.
     * Organized by source table, with each relationship specifying a tuple of [junction table name, destination table name].
     *
     * @example
     * ```ts
     * {
     *   user: {
     *     comments: ['message', 'comment']
     *   }
     * }
     * ```
     */
    readonly manyToMany?: TManyConfig;

    /**
     * The casing to use for the table name.
     *
     * @example
     * ```ts
     * { casing: 'snake_case' }
     * ```
     */
    readonly casing?: TCasing;

    /**
     * Whether to enable debug mode.
     *
     * @example
     * ```ts
     * { debug: true }
     * ```
     */
    readonly debug?: boolean;
  },
): Flatten<DrizzleToZeroSchema<TDrizzleSchema, TColumnConfig>> => {
  let tables: any[] = [];

  const tableColumnNamesForSourceTable = new Map<string, Set<string>>();

  const assertRelationNameIsNotAColumnName = ({
    sourceTableName,
    relationName,
  }: {
    sourceTableName: string;
    relationName: string;
  }) => {
    const tableColumnNames =
      tableColumnNamesForSourceTable.get(sourceTableName);

    if (tableColumnNames?.has(relationName)) {
      throw new Error(
        `zero-drizzle: Invalid relationship name for ${String(sourceTableName)}.${relationName}: there is already a table column with the name ${relationName} and this cannot be used as a relationship name`,
      );
    }
  };

  for (const [tableName, tableOrRelations] of typedEntries(schema)) {
    if (!tableOrRelations) {
      throw new Error(
        `zero-drizzle: table or relation with key ${String(tableName)} is not defined`,
      );
    }

    if (is(tableOrRelations, Table)) {
      const table = tableOrRelations;

      const tableConfig = config?.tables?.[tableName as keyof TColumnConfig];

      if (
        config?.tables !== undefined &&
        (tableConfig === false || tableConfig === undefined)
      ) {
        debugLog(
          config?.debug,
          `Skipping table ${String(tableName)} - ${
            tableConfig === false
              ? "explicitly excluded"
              : "not mentioned in config"
          }`,
        );
        continue;
      }

      const tableSchema = createZeroTableBuilder(
        String(tableName),
        table,
        tableConfig,
        config?.debug,
        config?.casing,
      );

      tables.push(tableSchema);

      const tableColumnNames = new Set<string>();

      for (const columnName of Object.keys(tableSchema.schema.columns)) {
        tableColumnNames.add(columnName);
      }

      tableColumnNamesForSourceTable.set(String(tableName), tableColumnNames);
    }
  }

  if (tables.length === 0) {
    throw new Error(
      schema["tables"]
        ? "❌ zero-drizzle: No tables found in the input - did you pass in a Zero schema to the `drizzleZeroConfig` function instead of a Drizzle schema?"
        : "❌ zero-drizzle: No tables found in the input - did you export tables and relations from the Drizzle schema passed to the `drizzleZeroConfig` function?",
    );
  }

  let relationships = {} as Record<string, Record<string, Array<unknown>>>;

  // Map many-to-many relationships
  if (config?.manyToMany) {
    for (const [sourceTableName, manyConfig] of Object.entries(
      config.manyToMany,
    )) {
      if (!manyConfig) continue;

      for (const [
        relationName,
        [junctionTableNameOrObject, destTableNameOrObject],
      ] of Object.entries(manyConfig)) {
        if (
          typeof junctionTableNameOrObject === "string" &&
          typeof destTableNameOrObject === "string"
        ) {
          const junctionTableName = junctionTableNameOrObject;
          const destTableName = destTableNameOrObject;

          const sourceTable = typedEntries(schema).find(
            ([tableName, tableOrRelations]) =>
              is(tableOrRelations, Table) && tableName === sourceTableName,
          )?.[1];
          const destTable = typedEntries(schema).find(
            ([tableName, tableOrRelations]) =>
              is(tableOrRelations, Table) && tableName === destTableName,
          )?.[1];
          const junctionTable = typedEntries(schema).find(
            ([tableName, tableOrRelations]) =>
              is(tableOrRelations, Table) && tableName === junctionTableName,
          )?.[1];

          if (
            !sourceTable ||
            !destTable ||
            !junctionTable ||
            !is(sourceTable, Table) ||
            !is(destTable, Table) ||
            !is(junctionTable, Table)
          ) {
            throw new Error(
              `zero-drizzle: Invalid many-to-many configuration for ${String(sourceTableName)}.${relationName}: Could not find ${!sourceTable ? "source" : !destTable ? "destination" : "junction"} table`,
            );
          }

          // Find source->junction and junction->dest relationships
          const sourceJunctionFields = findRelationSourceAndDestFields(schema, {
            sourceTable,
            referencedTableName: getTableName(junctionTable),
            referencedTable: junctionTable,
          });

          const junctionDestFields = findRelationSourceAndDestFields(schema, {
            sourceTable: destTable,
            referencedTableName: getTableName(junctionTable),
            referencedTable: junctionTable,
          });

          if (
            !sourceJunctionFields.sourceFieldNames.length ||
            !junctionDestFields.sourceFieldNames.length ||
            !junctionDestFields.destFieldNames.length ||
            !sourceJunctionFields.destFieldNames.length
          ) {
            throw new Error(
              `zero-drizzle: Invalid many-to-many configuration for ${String(sourceTableName)}.${relationName}: Could not find relationships in junction table ${junctionTableName}`,
            );
          }

          if (
            !config.tables?.[junctionTableName as keyof typeof config.tables] ||
            !config.tables?.[sourceTableName as keyof typeof config.tables] ||
            !config.tables?.[destTableName as keyof typeof config.tables]
          ) {
            debugLog(
              config.debug,
              `Skipping many-to-many relationship - tables not in schema config:`,
              { junctionTable, sourceTableName, destTableName },
            );
            continue;
          }

          assertRelationNameIsNotAColumnName({
            sourceTableName,
            relationName,
          });

          relationships[sourceTableName as keyof typeof relationships] = {
            ...(relationships?.[
              sourceTableName as keyof typeof relationships
            ] ?? {}),
            [relationName]: [
              {
                sourceField: sourceJunctionFields.sourceFieldNames,
                destField: sourceJunctionFields.destFieldNames,
                destSchema: junctionTableName,
                cardinality: "many",
              },
              {
                sourceField: junctionDestFields.destFieldNames,
                destField: junctionDestFields.sourceFieldNames,
                destSchema: destTableName,
                cardinality: "many",
              },
            ],
          };

          debugLog(config.debug, `Added many-to-many relationship:`, {
            sourceTable: sourceTableName,
            relationName,
            relationship:
              relationships[sourceTableName as keyof typeof relationships]?.[
                relationName
              ],
          });
        } else {
          const junctionTableName =
            (junctionTableNameOrObject as { destTable: string })?.destTable ??
            null;
          const junctionSourceField =
            (junctionTableNameOrObject as { sourceField: string[] })
              ?.sourceField ?? null;
          const junctionDestField =
            (junctionTableNameOrObject as { destField: string[] })?.destField ??
            null;

          const destTableName =
            (destTableNameOrObject as { destTable: string })?.destTable ?? null;
          const destSourceField =
            (destTableNameOrObject as { sourceField: string[] })?.sourceField ??
            null;
          const destDestField =
            (destTableNameOrObject as { destField: string[] })?.destField ??
            null;

          if (
            !junctionSourceField ||
            !junctionDestField ||
            !destSourceField ||
            !destDestField ||
            !junctionTableName ||
            !destTableName
          ) {
            throw new Error(
              `zero-drizzle: Invalid many-to-many configuration for ${String(sourceTableName)}.${relationName}: Not all required fields were provided.`,
            );
          }

          if (
            !config.tables?.[junctionTableName as keyof typeof config.tables] ||
            !config.tables?.[sourceTableName as keyof typeof config.tables] ||
            !config.tables?.[destTableName as keyof typeof config.tables]
          ) {
            // skip if any of the tables are not defined in the schema config
            continue;
          }

          assertRelationNameIsNotAColumnName({
            sourceTableName,
            relationName,
          });

          relationships[sourceTableName as keyof typeof relationships] = {
            ...(relationships?.[
              sourceTableName as keyof typeof relationships
            ] ?? {}),
            [relationName]: [
              {
                sourceField: junctionSourceField,
                destField: junctionDestField,
                destSchema: junctionTableName,
                cardinality: "many",
              },
              {
                sourceField: destSourceField,
                destField: destDestField,
                destSchema: destTableName,
                cardinality: "many",
              },
            ],
          };
        }
      }
    }
  }

  // get relationships from relations
  for (const [relationName, tableOrRelations] of typedEntries(schema)) {
    if (!tableOrRelations) {
      throw new Error(
        `zero-drizzle: table or relation with key ${String(relationName)} is not defined`,
      );
    }

    if (is(tableOrRelations, Relations)) {
      const actualTableName = getTableName(tableOrRelations.table);
      const tableName = getDrizzleKeyFromTable({
        schema,
        table: tableOrRelations.table,
        fallbackTableName: actualTableName,
      });

      const relationsConfig = getRelationsConfig(tableOrRelations);

      for (const relation of Object.values(relationsConfig)) {
        let sourceFieldNames: string[] = [];
        let destFieldNames: string[] = [];

        if (is(relation, One)) {
          sourceFieldNames =
            relation?.config?.fields?.map((f) =>
              getDrizzleColumnKeyFromColumnName({
                columnName: f?.name,
                table: f.table,
              }),
            ) ?? [];
          destFieldNames =
            relation?.config?.references?.map((f) =>
              getDrizzleColumnKeyFromColumnName({
                columnName: f?.name,
                table: f.table,
              }),
            ) ?? [];
        }

        if (!sourceFieldNames.length || !destFieldNames.length) {
          if (relation.relationName) {
            const sourceAndDestFields = findNamedSourceAndDestFields(
              schema,
              relation,
            );

            sourceFieldNames = sourceAndDestFields.sourceFieldNames;
            destFieldNames = sourceAndDestFields.destFieldNames;
          } else {
            const sourceAndDestFields = findRelationSourceAndDestFields(
              schema,
              relation,
            );

            sourceFieldNames = sourceAndDestFields.sourceFieldNames;
            destFieldNames = sourceAndDestFields.destFieldNames;
          }
        }

        if (!sourceFieldNames.length || !destFieldNames.length) {
          throw new Error(
            `zero-drizzle: No relationship found for: ${relation.fieldName} (${is(relation, One) ? "One" : "Many"} from ${String(tableName)} to ${relation.referencedTableName}). Did you forget to define ${relation.relationName ? `a named relation "${relation.relationName}"` : `an opposite ${is(relation, One) ? "Many" : "One"} relation`}?`,
          );
        }

        const referencedTableKey = getDrizzleKeyFromTable({
          schema,
          table: relation.referencedTable,
          fallbackTableName: relation.referencedTableName,
        });

        if (
          typeof config?.tables !== "undefined" &&
          (!config?.tables?.[tableName as keyof typeof config.tables] ||
            !config?.tables?.[referencedTableKey as keyof typeof config.tables])
        ) {
          debugLog(
            config?.debug,
            `Skipping relation - tables not in schema config:`,
            {
              sourceTable: tableName,
              referencedTable: referencedTableKey,
            },
          );
          continue;
        }

        if (
          relationships[tableName as keyof typeof relationships]?.[
            relation.fieldName
          ]
        ) {
          throw new Error(
            `zero-drizzle: Duplicate relationship found for: ${relation.fieldName} (from ${String(tableName)} to ${relation.referencedTableName}).`,
          );
        }

        assertRelationNameIsNotAColumnName({
          sourceTableName: tableName,
          relationName: relation.fieldName,
        });

        relationships[tableName as keyof typeof relationships] = {
          ...(relationships?.[tableName as keyof typeof relationships] ?? {}),
          [relation.fieldName]: [
            {
              sourceField: sourceFieldNames,
              destField: destFieldNames,
              destSchema: getDrizzleKeyFromTable({
                schema,
                table: relation.referencedTable,
                fallbackTableName: relation.referencedTableName,
              }),
              cardinality: is(relation, One) ? "one" : "many",
            },
          ],
        } as unknown as (typeof relationships)[keyof typeof relationships];
      }
    }
  }

  const finalSchema = createSchema({
    tables,
    relationships: Object.entries(relationships).map(([key, value]) => ({
      name: key,
      relationships: value,
    })),
  } as any) as unknown as DrizzleToZeroSchema<TDrizzleSchema, TColumnConfig>;

  debugLog(
    config?.debug,
    "Output Zero schema",
    JSON.stringify(finalSchema, null, 2),
  );

  return finalSchema;
};

/**
 * Returns the table name that the relation points to, independently of
 * whether it is One or Many.
 */
const getReferencedTableName = (
  rel:
    | One
    | Many<any>
    | {
        sourceTable: Table;
        referencedTableName?: string;
        referencedTable?: Table;
      },
) => {
  if ("referencedTable" in rel && rel.referencedTable) {
    return getTableUniqueName(rel.referencedTable);
  }
  if ("referencedTableName" in rel && rel.referencedTableName) {
    return rel.referencedTableName; // Fallback when table instance is unavailable
  }
  return undefined;
};

/**
 * Helper function to find source and destination fields for foreign key relationships.
 * @param schema - The complete Drizzle schema
 * @param relation - The One or Many relation to find fields for
 * @returns Object containing source and destination field names
 */
const findRelationSourceAndDestFields = (
  schema: Record<string, unknown>,
  relation:
    | {
        sourceTable: Table;
        referencedTableName?: string;
        referencedTable?: Table;
      }
    | One
    | Many<any>,
) => {
  const sourceTableName = getTableUniqueName(relation.sourceTable);
  const referencedTableName = getReferencedTableName(relation);

  // We search through all relations in the schema
  for (const tableOrRelations of Object.values(schema)) {
    if (is(tableOrRelations, Relations)) {
      const relationsConfig = getRelationsConfig(tableOrRelations);

      for (const relationConfig of Object.values(relationsConfig)) {
        if (!is(relationConfig, One)) continue;

        const foundSourceName = getTableUniqueName(relationConfig.sourceTable);
        const foundReferencedName = getReferencedTableName(relationConfig);

        // We check  the relation where the source table is the referenced table
        // and the referenced table is the source table
        if (
          foundSourceName === referencedTableName &&
          foundReferencedName === sourceTableName
        ) {
          const sourceFieldNames =
            relationConfig.config?.references?.map((f) =>
              getDrizzleColumnKeyFromColumnName({
                columnName: f.name,
                table: f.table,
              }),
            ) ?? [];

          const destFieldNames =
            relationConfig.config?.fields?.map((f) =>
              getDrizzleColumnKeyFromColumnName({
                columnName: f.name,
                table: f.table,
              }),
            ) ?? [];

          if (sourceFieldNames.length && destFieldNames.length) {
            return {
              sourceFieldNames,
              destFieldNames,
            };
          }
        }

        // Check if this is a One relation from source table to referenced table
        // with the correct fields
        if (
          foundSourceName === sourceTableName &&
          foundReferencedName === referencedTableName
        ) {
          const sourceFieldNames =
            relationConfig.config?.fields?.map((f) =>
              getDrizzleColumnKeyFromColumnName({
                columnName: f.name,
                table: f.table,
              }),
            ) ?? [];

          const destFieldNames =
            relationConfig.config?.references?.map((f) =>
              getDrizzleColumnKeyFromColumnName({
                columnName: f.name,
                table: f.table,
              }),
            ) ?? [];

          if (sourceFieldNames.length && destFieldNames.length) {
            return {
              sourceFieldNames,
              destFieldNames,
            };
          }
        }
      }
    }
  }

  return {
    sourceFieldNames: [],
    destFieldNames: [],
  };
};

/**
 * Helper function to find source and destination fields for named relationships.
 * @param schema - The complete Drizzle schema
 * @param relation - The One or Many relation to find fields for
 * @returns Object containing source and destination field names
 */
const findNamedSourceAndDestFields = (
  schema: Record<string, unknown>,
  relation: One | Many<any>,
) => {
  for (const tableOrRelations of Object.values(schema)) {
    if (is(tableOrRelations, Relations)) {
      const relationsConfig = getRelationsConfig(tableOrRelations);

      for (const relationConfig of Object.values(relationsConfig)) {
        if (
          is(relationConfig, One) &&
          relationConfig.relationName === relation.relationName
        ) {
          return {
            destFieldNames:
              relationConfig.config?.fields?.map((f) =>
                getDrizzleColumnKeyFromColumnName({
                  columnName: f.name,
                  table: f.table,
                }),
              ) ?? [],
            sourceFieldNames:
              relationConfig.config?.references?.map((f) =>
                getDrizzleColumnKeyFromColumnName({
                  columnName: f.name,
                  table: f.table,
                }),
              ) ?? [],
          };
        }
      }
    }
  }

  return {
    sourceFieldNames: [],
    destFieldNames: [],
  };
};

/**
 * Helper function to get the relations configuration from a Relations object.
 * @param relations - The Relations object to get configuration from
 * @returns Record of relation configurations
 */
const getRelationsConfig = (relations: Relations) => {
  return relations.config(
    createTableRelationsHelpers(relations.table),
  ) as Record<string, One | Many<any>>;
};

/**
 * Get the key of a table in the schema from the table name.
 * @param schema - The complete Drizzle schema
 * @param tableName - The name of the table to get the key for
 * @returns The key of the table in the schema
 */
const getDrizzleKeyFromTable = ({
  schema,
  table,
  fallbackTableName,
}: {
  schema: Record<string, unknown>;
  table?: Table;
  fallbackTableName?: string;
}) => {
  if (table) {
    const directMatch = typedEntries(schema).find(
      ([_name, tableOrRelations]) =>
        is(tableOrRelations, Table) && tableOrRelations === table,
    )?.[0];

    if (directMatch) {
      return directMatch;
    }

    const uniqueName = getTableUniqueName(table);
    const uniqueMatch = typedEntries(schema).find(
      ([_name, tableOrRelations]) =>
        is(tableOrRelations, Table) &&
        getTableUniqueName(tableOrRelations) === uniqueName,
    )?.[0];

    if (uniqueMatch) {
      return uniqueMatch;
    }
  }

  if (fallbackTableName) {
    const fallbackMatch = typedEntries(schema).find(
      ([_name, tableOrRelations]) =>
        is(tableOrRelations, Table) &&
        getTableName(tableOrRelations) === fallbackTableName,
    )?.[0];

    if (fallbackMatch) {
      return fallbackMatch;
    }
  }

  throw new Error(
    `zero-drizzle: Unable to resolve table key for ${table ? getTableUniqueName(table) : fallbackTableName}`,
  );
};

export {
  drizzleZeroConfig,
  type CustomType,
  type DrizzleToZeroSchema,
  type ZeroCustomType,
};
