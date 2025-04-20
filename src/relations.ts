import { createSchema } from "@rocicorp/zero";
import {
  createTableRelationsHelpers,
  getTableName,
  is,
  Many,
  One,
  Relations,
  Table,
} from "drizzle-orm";
import {
  createZeroTableBuilder,
  getDrizzleColumnKeyFromColumnName,
  type ZeroTableBuilderSchema,
} from "./tables";
import type {
  Columns,
  FindRelationsForTable,
  FindTableByKey,
  FindTableByName,
  FindTableKeyByTableName,
  Flatten,
  RelationsConfig,
  TableColumnsConfig,
} from "./types";
import { debugLog, typedEntries } from "./util";

/**
 * Gets the keys of columns that can be used as indexes.
 * @template TTable - The table to get index keys from
 */
type ColumnIndexKeys<TTable extends Table> = {
  [K in keyof Columns<TTable>]: K;
}[keyof Columns<TTable>];

/**
 * Extracts the table name from a configuration object or string.
 * @template TTableConfig - The configuration object or string
 */
type ExtractTableConfigName<TTableConfig> = TTableConfig extends {
  readonly destTable: string;
}
  ? TTableConfig["destTable"]
  : TTableConfig extends string
    ? TTableConfig
    : never;

/**
 * Represents the structure of a many-to-many relationship through a junction table.
 * @template TDrizzleSchema - The complete Drizzle schema
 * @template TColumnConfig - Configuration for the tables
 * @template TManyConfig - Configuration for many-to-many relationships
 * @template TTableName extends keyof TColumnConfig & keyof TManyConfig
 */
type ManyToManyRelationship<
  TDrizzleSchema extends { [K in string]: unknown },
  TColumnConfig extends TableColumnsConfig<TDrizzleSchema>,
  TManyConfig extends ManyConfig<TDrizzleSchema, TColumnConfig>,
  TTableName extends keyof TColumnConfig & keyof TManyConfig,
> = TTableName extends keyof TColumnConfig & keyof TManyConfig
  ? TManyConfig[TTableName] extends ManyTableConfig<
      TDrizzleSchema,
      TColumnConfig,
      TTableName
    >
    ? {
        [K in keyof TManyConfig[TTableName]]: [
          {
            readonly sourceField: string[];
            readonly destField: ColumnIndexKeys<
              FindTableByKey<
                TDrizzleSchema,
                ExtractTableConfigName<TManyConfig[TTableName][K][0]>
              >
            >[];
            readonly destSchema: ExtractTableConfigName<
              TManyConfig[TTableName][K][0]
            >;
            readonly cardinality: "many";
          },
          {
            readonly sourceField: string[];
            readonly destField: ColumnIndexKeys<
              FindTableByKey<
                TDrizzleSchema,
                ExtractTableConfigName<TManyConfig[TTableName][K][1]>
              >
            >[];
            readonly destSchema: ExtractTableConfigName<
              TManyConfig[TTableName][K][1]
            >;
            readonly cardinality: "many";
          },
        ];
      }
    : {}
  : {};

/**
 * Gets the valid direct relation keys for a table that have corresponding table configurations.
 * @template TDrizzleSchema - The complete Drizzle schema
 * @template TColumnConfig - Configuration for the tables
 * @template TCurrentTableRelations - Relations defined for the current table
 */
type ValidDirectRelationKeys<
  TDrizzleSchema extends Record<string, unknown>,
  TColumnConfig extends TableColumnsConfig<TDrizzleSchema>,
  TCurrentTableRelations extends Relations,
> = keyof RelationsConfig<TCurrentTableRelations> &
  {
    [K in keyof RelationsConfig<TCurrentTableRelations>]: RelationsConfig<TCurrentTableRelations>[K]["referencedTable"] extends Table<any>
      ? {
          [SchemaKey in keyof TDrizzleSchema]: TDrizzleSchema[SchemaKey] extends RelationsConfig<TCurrentTableRelations>[K]["referencedTable"]
            ? TColumnConfig[SchemaKey & keyof TColumnConfig] extends object
              ? K
              : never
            : never;
        }[keyof TDrizzleSchema]
      : never;
  }[keyof RelationsConfig<TCurrentTableRelations>];

/**
 * Represents a direct relationship between tables.
 * @template TDrizzleSchema - The complete Drizzle schema
 * @template TColumnConfig - Configuration for the tables
 * @template TManyConfig - Configuration for many-to-many relationships
 * @template TCurrentTable - The current table being processed
 * @template TCurrentTableRelations - Relations defined for the current table
 */
type DirectRelationships<
  TDrizzleSchema extends Record<string, unknown>,
  TColumnConfig extends TableColumnsConfig<TDrizzleSchema>,
  TCurrentTableRelations extends Relations,
> = [TCurrentTableRelations] extends [never]
  ? {}
  : {
      [K in ValidDirectRelationKeys<
        TDrizzleSchema,
        TColumnConfig,
        TCurrentTableRelations
      >]: [
        {
          readonly sourceField: string[];
          readonly destField: ColumnIndexKeys<
            FindTableByName<
              TDrizzleSchema,
              RelationsConfig<TCurrentTableRelations>[K]["referencedTableName"]
            >
          >[];
          readonly destSchema: FindTableKeyByTableName<
            TDrizzleSchema,
            RelationsConfig<TCurrentTableRelations>[K]["referencedTableName"]
          >;
          readonly cardinality: RelationsConfig<TCurrentTableRelations>[K] extends One
            ? "one"
            : "many";
        },
      ];
    };

/**
 * Configuration type for many-to-many relationships for a specific table.
 * @template TDrizzleSchema - The complete Drizzle schema
 * @template TColumnConfig - Configuration for the tables
 * @template TSourceTableName - The name of the source table
 */
type ManyTableConfig<
  TDrizzleSchema extends Record<string, unknown>,
  TColumnConfig extends TableColumnsConfig<TDrizzleSchema>,
  TSourceTableName extends keyof TColumnConfig,
> = {
  readonly [TRelationName: string]:
    | readonly [keyof TColumnConfig, keyof TColumnConfig]
    | {
        [K in keyof TColumnConfig]: {
          [L in keyof TColumnConfig]: readonly [
            {
              readonly destTable: K;
              readonly sourceField: (keyof TColumnConfig[TSourceTableName])[];
              readonly destField: (keyof TColumnConfig[K])[];
            },
            {
              readonly destTable: L;
              readonly sourceField: (keyof TColumnConfig[K])[];
              readonly destField: (keyof TColumnConfig[L])[];
            },
          ];
        }[keyof TColumnConfig];
      }[keyof TColumnConfig];
};

/**
 * Configuration for many-to-many relationships across all tables.
 * Organized by source table, with each relationship specifying a tuple of [junction table name, destination table name].
 * The junction table and destination table must be different from the source table and each other.
 */
type ManyConfig<
  TDrizzleSchema extends Record<string, unknown>,
  TColumnConfig extends TableColumnsConfig<TDrizzleSchema>,
> = [keyof TColumnConfig] extends [never]
  ? never
  : {
      readonly [TSourceTableName in keyof TColumnConfig]?: ManyTableConfig<
        TDrizzleSchema,
        TColumnConfig,
        TSourceTableName
      >;
    };

/**
 * Represents all referenced Zero schemas for a table, including both direct and many-to-many relationships.
 * @template TDrizzleSchema - The complete Drizzle schema
 * @template TColumnConfig - Configuration for the tables
 * @template TManyConfig - Configuration for many-to-many relationships
 * @template TTableName extends keyof TColumnConfig & keyof TManyConfig
 * @template TTable extends Table<any>
 */
type ReferencedZeroSchemas<
  TDrizzleSchema extends Record<string, unknown>,
  TColumnConfig extends TableColumnsConfig<TDrizzleSchema>,
  TManyConfig extends ManyConfig<TDrizzleSchema, TColumnConfig>,
  TTableName extends keyof TColumnConfig & keyof TManyConfig,
  TTable extends Table<any>,
> = DirectRelationships<
  TDrizzleSchema,
  TColumnConfig,
  FindRelationsForTable<TDrizzleSchema, TTable>
> &
  ManyToManyRelationship<
    TDrizzleSchema,
    TColumnConfig,
    TManyConfig,
    TTableName
  >;

/**
 * The complete Zero schema type with version and tables.
 * @template TDrizzleSchema - The complete Drizzle schema
 * @template TColumnConfig - Configuration for the tables
 * @template TManyConfig - Configuration for many-to-many relationships
 * @template TTableBuilderOptions - Options for the table builder
 */
type CreateZeroSchema<
  TDrizzleSchema extends { [K in string]: unknown },
  TColumnConfig extends TableColumnsConfig<TDrizzleSchema>,
  TManyConfig extends ManyConfig<TDrizzleSchema, TColumnConfig>,
> = {
  readonly tables: {
    [K in keyof TDrizzleSchema &
      keyof TColumnConfig as TDrizzleSchema[K] extends Table<any>
      ? TColumnConfig[K] extends object
        ? K
        : never
      : never]: TDrizzleSchema[K] extends Table<any>
      ? Flatten<
          ZeroTableBuilderSchema<
            K & string,
            TDrizzleSchema[K],
            TColumnConfig[K]
          >
        >
      : never;
  };
  readonly relationships: {
    [K in keyof TDrizzleSchema &
      keyof TColumnConfig as TDrizzleSchema[K] extends Table<any>
      ? TColumnConfig[K] extends object
        ? [
            ReferencedZeroSchemas<
              TDrizzleSchema,
              TColumnConfig,
              TManyConfig,
              K,
              TDrizzleSchema[K]
            >,
          ] extends [never]
          ? never
          : keyof ReferencedZeroSchemas<
                TDrizzleSchema,
                TColumnConfig,
                TManyConfig,
                K,
                TDrizzleSchema[K]
              > extends never
            ? never
            : K
        : never
      : never]: TDrizzleSchema[K] extends Table<any>
      ? ReferencedZeroSchemas<
          TDrizzleSchema,
          TColumnConfig,
          TManyConfig,
          K,
          TDrizzleSchema[K]
        >
      : never;
  };
};

/**
 * Create a Zero schema from a Drizzle schema. This function transforms your Drizzle ORM schema
 * into a Zero schema format, handling both direct relationships and many-to-many relationships.
 *
 * The function allows you to:
 * - Select which tables to include in the Zero schema
 * - Configure column types and transformations
 * - Define many-to-many relationships through junction tables
 *
 * @deprecated Use `drizzleZeroConfig` instead.
 *
 * @param schema - The Drizzle schema to create a Zero schema from. This should be your complete Drizzle schema object
 *                containing all your table definitions and relationships.
 * @param schemaConfig - Configuration object for the Zero schema generation
 * @param schemaConfig.tables - Specify which tables and columns to include in sync
 * @param schemaConfig.manyToMany - Optional configuration for many-to-many relationships through junction tables
 *
 * @returns A Zero schema containing tables and their relationships
 *
 * @example
 * ```typescript
 * import { integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
 * import { relations } from 'drizzle-orm';
 * import { createZeroSchema } from 'drizzle-zero';
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
 * // Create Zero schema
 * const zeroSchema = createZeroSchema(
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
const createZeroSchema = <
  const TDrizzleSchema extends { [K in string]: unknown },
  const TColumnConfig extends TableColumnsConfig<TDrizzleSchema>,
  const TManyConfig extends ManyConfig<TDrizzleSchema, TColumnConfig>,
>(
  /**
   * The Drizzle schema to create a Zero schema from.
   */
  schema: TDrizzleSchema,
  /**
   * The configuration for the Zero schema.
   *
   * @param schemaConfig.tables - The tables to include in the Zero schema.
   * @param schemaConfig.many - Configuration for many-to-many relationships.
   */
  schemaConfig: {
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
    readonly tables: TColumnConfig;
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
     * Whether to enable debug mode.
     *
     * @example
     * ```ts
     * { debug: true }
     * ```
     */
    readonly debug?: boolean;

    /**
     * Hidden option for internal use by the CLI.
     *
     * @internal
     */
    readonly "~__cli"?: boolean;
  },
): Flatten<CreateZeroSchema<TDrizzleSchema, TColumnConfig, TManyConfig>> => {
  let tables: any[] = [];

  if (!schemaConfig["~__cli"]) {
    console.warn(
      "🚨 drizzle-zero: importing drizzle-zero directly from a project will be deprecated in a future 1.x.x version. Please migrate to use the CLI instead: https://github.com/BriefHQ/drizzle-zero.",
    );
  }

  for (const [tableName, tableOrRelations] of typedEntries(schema)) {
    if (is(tableOrRelations, Table)) {
      const table = tableOrRelations;

      const tableConfig = schemaConfig.tables[tableName as keyof TColumnConfig];

      // skip tables that don't have a config
      if (!tableConfig) {
        debugLog(
          schemaConfig.debug,
          `Skipping table ${String(tableName)} - no config provided`,
        );
        continue;
      }

      const tableSchema = createZeroTableBuilder(
        String(tableName),
        table,
        tableConfig,
      );

      tables.push(tableSchema);
    }
  }

  let relationships = {} as Record<
    keyof typeof schemaConfig.tables,
    Record<string, Array<unknown>>
  >;

  // Map many-to-many relationships
  if (schemaConfig.manyToMany) {
    for (const [sourceTableName, manyConfig] of Object.entries(
      schemaConfig.manyToMany,
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
              `drizzle-zero: Invalid many-to-many configuration for ${String(sourceTableName)}.${relationName}: Could not find ${!sourceTable ? "source" : !destTable ? "destination" : "junction"} table`,
            );
          }

          // Find source->junction and junction->dest relationships
          const sourceJunctionFields = findRelationSourceAndDestFields(schema, {
            sourceTable: sourceTable,
            referencedTableName: getTableName(junctionTable),
          });

          const junctionDestFields = findRelationSourceAndDestFields(schema, {
            sourceTable: destTable,
            referencedTableName: getTableName(junctionTable),
          });

          if (
            !sourceJunctionFields.sourceFieldNames.length ||
            !junctionDestFields.sourceFieldNames.length ||
            !junctionDestFields.destFieldNames.length ||
            !sourceJunctionFields.destFieldNames.length
          ) {
            throw new Error(
              `drizzle-zero: Invalid many-to-many configuration for ${String(sourceTableName)}.${relationName}: Could not find relationships in junction table ${junctionTableName}`,
            );
          }

          if (
            !schemaConfig.tables[
              junctionTableName as keyof typeof schemaConfig.tables
            ] ||
            !schemaConfig.tables[
              sourceTableName as keyof typeof schemaConfig.tables
            ] ||
            !schemaConfig.tables[
              destTableName as keyof typeof schemaConfig.tables
            ]
          ) {
            debugLog(
              schemaConfig.debug,
              `Skipping many-to-many relationship - tables not in schema config:`,
              { junctionTable, sourceTableName, destTableName },
            );
            continue;
          }

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

          debugLog(schemaConfig.debug, `Added many-to-many relationship:`, {
            sourceTable: sourceTableName,
            relationName,
            relationship:
              relationships[sourceTableName as keyof typeof relationships][
                relationName
              ],
          });
        } else {
          const junctionTableName =
            junctionTableNameOrObject?.destTable ?? null;
          const junctionSourceField =
            junctionTableNameOrObject?.sourceField ?? null;
          const junctionDestField =
            junctionTableNameOrObject?.destField ?? null;

          const destTableName = destTableNameOrObject?.destTable ?? null;
          const destSourceField = destTableNameOrObject?.sourceField ?? null;
          const destDestField = destTableNameOrObject?.destField ?? null;

          if (
            !junctionSourceField ||
            !junctionDestField ||
            !destSourceField ||
            !destDestField ||
            !junctionTableName ||
            !destTableName
          ) {
            throw new Error(
              `drizzle-zero: Invalid many-to-many configuration for ${String(sourceTableName)}.${relationName}: Not all required fields were provided.`,
            );
          }

          if (
            !schemaConfig.tables[
              junctionTableName as keyof typeof schemaConfig.tables
            ] ||
            !schemaConfig.tables[
              sourceTableName as keyof typeof schemaConfig.tables
            ] ||
            !schemaConfig.tables[
              destTableName as keyof typeof schemaConfig.tables
            ]
          ) {
            // skip if any of the tables are not defined in the schema config
            continue;
          }

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
  for (const [_relationName, tableOrRelations] of typedEntries(schema)) {
    if (is(tableOrRelations, Relations)) {
      const actualTableName = getTableName(tableOrRelations.table);
      const tableName = getDrizzleKeyFromTableName({
        schema,
        tableName: actualTableName,
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
            `drizzle-zero: No relationship found for: ${relation.fieldName} (${is(relation, One) ? "One" : "Many"} from ${String(tableName)} to ${relation.referencedTableName}). Did you forget to define foreign keys${relation.relationName ? ` for named relation "${relation.relationName}"` : ""}?`,
          );
        }

        const referencedTableKey = getDrizzleKeyFromTableName({
          schema,
          tableName: relation.referencedTableName,
        });

        if (
          !schemaConfig.tables[tableName as keyof typeof schemaConfig.tables] ||
          !schemaConfig.tables[
            referencedTableKey as keyof typeof schemaConfig.tables
          ]
        ) {
          debugLog(
            schemaConfig.debug,
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
            `drizzle-zero: Duplicate relationship found for: ${relation.fieldName} (from ${String(tableName)} to ${relation.referencedTableName}).`,
          );
        }

        relationships[tableName as keyof typeof relationships] = {
          ...(relationships?.[tableName as keyof typeof relationships] ?? {}),
          [relation.fieldName]: [
            {
              sourceField: sourceFieldNames,
              destField: destFieldNames,
              destSchema: getDrizzleKeyFromTableName({
                schema,
                tableName: relation.referencedTableName,
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
  } as any) as unknown as CreateZeroSchema<
    TDrizzleSchema,
    TColumnConfig,
    TManyConfig
  >;

  debugLog(
    schemaConfig.debug,
    "Output Zero schema",
    JSON.stringify(finalSchema, null, 2),
  );

  return finalSchema;
};

/**
 * Helper function to find source and destination fields for foreign key relationships.
 * @param schema - The complete Drizzle schema
 * @param relation - The One or Many relation to find fields for
 * @returns Object containing source and destination field names
 */
const findRelationSourceAndDestFields = (
  schema: Record<string, unknown>,
  relation: {
    sourceTable: Table;
    referencedTableName: string;
  },
) => {
  const sourceTableName = getTableName(relation.sourceTable);

  // Search through all relations in the schema
  for (const tableOrRelations of Object.values(schema)) {
    if (is(tableOrRelations, Relations)) {
      const relationsConfig = getRelationsConfig(tableOrRelations);

      for (const relationConfig of Object.values(relationsConfig)) {
        // Check if this is a One relation from source table to referenced table
        if (
          is(relationConfig, One) &&
          getTableName(relationConfig.sourceTable) === sourceTableName &&
          relationConfig.referencedTableName === relation.referencedTableName
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

        // For a Many relation, find the opposite One relation
        // (When the referenced table has a One relation back to the source table)
        if (
          is(relationConfig, One) &&
          getTableName(relationConfig.sourceTable) ===
            relation.referencedTableName &&
          relationConfig.referencedTableName === sourceTableName
        ) {
          // Only access config fields if it's a One relation with config
          if (
            relationConfig.config?.fields &&
            relationConfig.config?.references
          ) {
            const sourceFieldNames = relationConfig.config.references.map((f) =>
              getDrizzleColumnKeyFromColumnName({
                columnName: f.name,
                table: f.table,
              }),
            );

            const destFieldNames = relationConfig.config.fields.map((f) =>
              getDrizzleColumnKeyFromColumnName({
                columnName: f.name,
                table: f.table,
              }),
            );

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
const getDrizzleKeyFromTableName = ({
  schema,
  tableName,
}: {
  schema: Record<string, unknown>;
  tableName: string;
}) => {
  return typedEntries(schema).find(
    ([_name, tableOrRelations]) =>
      is(tableOrRelations, Table) &&
      getTableName(tableOrRelations) === tableName,
  )?.[0]!;
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
 * @param schemaConfig - Configuration object for the Zero schema generation
 * @param schemaConfig.tables - Specify which tables and columns to include in sync
 * @param schemaConfig.manyToMany - Optional configuration for many-to-many relationships through junction tables
 *
 * @returns A configuration object for the Zero schema CLI.
 *
 * @example
 * ```typescript
 * import { integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
 * import { relations } from 'drizzle-orm';
 * import { drizzleZeroConfig } from 'drizzle-zero';
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
const drizzleZeroConfig: typeof createZeroSchema = (schema, config) =>
  createZeroSchema(schema, { ...config, "~__cli": true });

export { createZeroSchema, drizzleZeroConfig, type CreateZeroSchema };
