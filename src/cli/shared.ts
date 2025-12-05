import camelCase from "camelcase";
import pluralize from "pluralize";
import {
  type CodeBlockWriter,
  type Project,
  type SourceFile,
  VariableDeclarationKind,
} from "ts-morph";
import type { getConfigFromFile } from "./config";
import type { getDefaultConfig } from "./drizzle-kit";
import { COLUMN_SEPARATOR, resolveCustomTypes } from "./type-resolution";

export async function getGeneratedSchema({
  tsProject,
  result,
  outputFilePath,
  jsExtensionOverride = "auto",
  skipTypes = false,
  skipBuilder = false,
  skipDeclare = false,
  enableLegacyMutators = false,
  enableLegacyQueries = false,
  debug,
}: {
  tsProject: Project;
  result:
    | Awaited<ReturnType<typeof getConfigFromFile>>
    | Awaited<ReturnType<typeof getDefaultConfig>>;
  outputFilePath: string;
  jsExtensionOverride?: "auto" | "force" | "none";
  skipTypes?: boolean;
  skipBuilder?: boolean;
  skipDeclare?: boolean;
  enableLegacyMutators?: boolean;
  enableLegacyQueries?: boolean;
  debug?: boolean;
}) {
  // Auto-detect if .js extensions are needed based on tsconfig
  // unless explicitly overridden by the user
  let needsJsExtension = jsExtensionOverride === "force";

  if (jsExtensionOverride === "auto") {
    const compilerOptions = tsProject.getCompilerOptions();
    const moduleResolution = compilerOptions.moduleResolution;

    // ModuleResolutionKind enum values:
    // Classic = 1, NodeJs = 2, Node16 = 3, NodeNext = 99, Bundler = 100
    // We need .js extensions for Node16 (3) and NodeNext (99)
    // For NodeJs (2), we typically don't need them
    // For Bundler (100), we definitely don't need them
    needsJsExtension = moduleResolution === 3 || moduleResolution === 99;

    if (needsJsExtension && debug) {
      console.log(
        `ℹ️  drizzle-zero: Auto-detected moduleResolution requires .js extensions (moduleResolution=${moduleResolution})`,
      );
    }
  }

  const schemaObjectName = "schema";
  const typename = "Schema";

  const zeroSchemaGenerated = tsProject.createSourceFile(outputFilePath, "", {
    overwrite: true,
  });

  let resolverImportHelperFile: SourceFile | undefined;
  const getResolverImportModuleSpecifier = (sourceFile: SourceFile) => {
    if (!resolverImportHelperFile) {
      resolverImportHelperFile = tsProject.createSourceFile(
        "__drizzle_zero_type_resolver__imports.ts",
        "",
        { overwrite: true },
      );
    }

    const moduleSpecifier =
      resolverImportHelperFile.getRelativePathAsModuleSpecifierTo(sourceFile);

    if (needsJsExtension && !moduleSpecifier.endsWith(".js")) {
      return `${moduleSpecifier}.js`;
    }

    return moduleSpecifier;
  };

  let customTypeHelper: string;
  let zeroSchemaSpecifier: string | undefined;
  let schemaTypeExpression: string | undefined;
  const resolverImports: Parameters<
    typeof resolveCustomTypes
  >[0]["schemaImports"] = [];

  if (result.type === "config") {
    // For config mode, use ZeroCustomType with the config schema
    customTypeHelper = "ZeroCustomType";
    zeroSchemaGenerated.addImportDeclaration({
      moduleSpecifier: "drizzle-zero",
      namedImports: [{ name: customTypeHelper }],
      isTypeOnly: true,
    });
    const moduleSpecifier =
      zeroSchemaGenerated.getRelativePathAsModuleSpecifierTo(
        result.zeroSchemaTypeDeclarations[1].getSourceFile(),
      );
    const runtimeModuleSpecifier =
      needsJsExtension && !moduleSpecifier.endsWith(".js")
        ? `${moduleSpecifier}.js`
        : moduleSpecifier;
    // Add import for DrizzleConfigSchema
    zeroSchemaGenerated.addImportDeclaration({
      moduleSpecifier: runtimeModuleSpecifier,
      namedImports: [{ name: result.exportName, alias: "zeroSchema" }],
      isTypeOnly: true,
    });

    resolverImports.push({
      moduleSpecifier: getResolverImportModuleSpecifier(
        result.zeroSchemaTypeDeclarations[1].getSourceFile(),
      ),
      namedImports: [{ name: result.exportName, alias: "zeroSchema" }],
      isTypeOnly: true,
    });

    zeroSchemaSpecifier = "typeof zeroSchema";
    schemaTypeExpression = zeroSchemaSpecifier;
  } else {
    // For no-config mode, use CustomType to avoid expanding entire schema
    const moduleSpecifier =
      zeroSchemaGenerated.getRelativePathAsModuleSpecifierTo(
        result.drizzleSchemaSourceFile,
      );
    const runtimeModuleSpecifier =
      needsJsExtension && !moduleSpecifier.endsWith(".js")
        ? `${moduleSpecifier}.js`
        : moduleSpecifier;
    zeroSchemaGenerated.addImportDeclaration({
      moduleSpecifier: runtimeModuleSpecifier,
      namespaceImport: "drizzleSchema",
      isTypeOnly: true,
    });

    // Add import for CustomType - much faster than ZeroCustomType
    customTypeHelper = "CustomType";
    zeroSchemaGenerated.addImportDeclaration({
      moduleSpecifier: "drizzle-zero",
      namedImports: [{ name: customTypeHelper }],
      isTypeOnly: true,
    });
    zeroSchemaSpecifier = "typeof drizzleSchema";
    schemaTypeExpression = zeroSchemaSpecifier;
    resolverImports.push({
      moduleSpecifier: getResolverImportModuleSpecifier(
        result.drizzleSchemaSourceFile,
      ),
      namespaceImport: "drizzleSchema",
      isTypeOnly: true,
    });
  }

  const collectCustomTypeRequests = () => {
    const requests: { tableName: string; columnName: string }[] = [];

    const tables: Record<string, any> = (result.zeroSchema?.tables ??
      {}) as Record<string, any>;

    for (const [tableName, tableDef] of Object.entries(tables)) {
      if (!tableDef || typeof tableDef !== "object") {
        continue;
      }

      const columns = tableDef.columns as Record<string, any> | undefined;
      if (!columns || typeof columns !== "object") {
        continue;
      }

      for (const [columnName, columnDef] of Object.entries(columns)) {
        if (
          columnDef &&
          typeof columnDef === "object" &&
          Object.prototype.hasOwnProperty.call(columnDef, "customType") &&
          columnDef.customType === null
        ) {
          requests.push({ tableName, columnName });
        }
      }
    }

    return requests;
  };

  const customTypeRequests =
    schemaTypeExpression !== undefined ? collectCustomTypeRequests() : [];

  resolverImportHelperFile?.delete();

  const resolvedCustomTypes =
    schemaTypeExpression && customTypeRequests.length > 0
      ? resolveCustomTypes({
          project: tsProject,
          helperName: customTypeHelper as "CustomType" | "ZeroCustomType",
          schemaTypeExpression,
          schemaImports: resolverImports,
          requests: customTypeRequests,
        })
      : new Map<string, string>();

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

  const usedIdentifiers = new Set<string>([schemaObjectName]);
  const tableConstNames = new Map<string, string>();
  const relationshipConstNames = new Map<string, string>();
  let readonlyJSONValueImported = false;

  const sanitizeIdentifier = (value: string, fallback: string) => {
    const baseCandidate =
      camelCase(value, { pascalCase: false }) || value || fallback;
    const cleaned = baseCandidate.replace(/[^A-Za-z0-9_$]/g, "") || fallback;
    const startsValid = /^[A-Za-z_$]/.test(cleaned) ? cleaned : `_${cleaned}`;
    return startsValid.length > 0 ? startsValid : fallback;
  };

  const ensureSuffix = (identifier: string, suffix: string) =>
    identifier.toLowerCase().endsWith(suffix.toLowerCase())
      ? identifier
      : `${identifier}${suffix}`;

  const getUniqueIdentifier = (identifier: string) => {
    let candidate = identifier;
    let counter = 2;
    while (usedIdentifiers.has(candidate)) {
      candidate = `${identifier}${counter}`;
      counter += 1;
    }
    usedIdentifiers.add(candidate);
    return candidate;
  };

  const createConstName = (name: string, suffix: string, fallback: string) =>
    getUniqueIdentifier(
      ensureSuffix(sanitizeIdentifier(name, fallback), suffix),
    );

  const writeSchemaReferenceCollection = (
    writer: CodeBlockWriter,
    collection: Record<string, unknown>,
    constNameMap: Map<string, string>,
    indent: number,
  ) => {
    const indentStr = " ".repeat(indent);
    writer.write("{");
    const entries = Object.entries(collection);
    if (entries.length > 0) {
      writer.newLine();
      for (let i = 0; i < entries.length; i++) {
        const [key] = entries[i] ?? [];
        if (!key) {
          continue;
        }
        const identifier = constNameMap.get(key) ?? "undefined";
        writer.write(
          indentStr + "  " + JSON.stringify(key) + ": " + identifier,
        );
        if (i < entries.length - 1) {
          writer.write(",");
        }
        writer.newLine();
      }
      writer.write(indentStr);
    }
    writer.write("}");
  };

  type WriteValueOptions = {
    keys?: string[];
    indent?: number;
    mode?: "default" | "schema";
  };

  const writeValue = (
    writer: CodeBlockWriter,
    value: unknown,
    { keys = [], indent = 0, mode = "default" }: WriteValueOptions = {},
  ) => {
    const indentStr = " ".repeat(indent);

    if (
      !value ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      Array.isArray(value)
    ) {
      const serialized = JSON.stringify(value);
      writer.write(serialized ?? "undefined");
      return;
    }

    if (typeof value === "object" && value !== null) {
      writer.write("{");

      const entries = Object.entries(value);

      if (entries.length > 0) {
        writer.newLine();

        for (let i = 0; i < entries.length; i++) {
          const [key, propValue] = entries[i] ?? [];

          if (!key) {
            continue;
          }

          writer.write(indentStr + "  " + JSON.stringify(key) + ": ");

          if (
            mode === "schema" &&
            keys.length === 0 &&
            key === "tables" &&
            isRecord(propValue)
          ) {
            writeSchemaReferenceCollection(
              writer,
              propValue,
              tableConstNames,
              indent + 2,
            );
          } else if (
            mode === "schema" &&
            keys.length === 0 &&
            key === "relationships" &&
            isRecord(propValue)
          ) {
            writeSchemaReferenceCollection(
              writer,
              propValue,
              relationshipConstNames,
              indent + 2,
            );
          } else if (key === "customType" && propValue === null) {
            const tableIndex = 1;
            const columnIndex = 3;
            const tableName = keys[tableIndex];
            const columnName = keys[columnIndex];
            const resolvedType =
              typeof tableName === "string" && typeof columnName === "string"
                ? resolvedCustomTypes.get(
                    `${tableName}${COLUMN_SEPARATOR}${columnName}`,
                  )
                : undefined;

            if (resolvedType) {
              writer.write(`null as unknown as ${resolvedType}`);

              if (resolvedType === "ReadonlyJSONValue") {
                readonlyJSONValueImported = true;
              }
            } else {
              writer.write(
                `null as unknown as ${customTypeHelper}<${zeroSchemaSpecifier}, "${keys[tableIndex]}", "${keys[columnIndex]}">`,
              );
            }
          } else if (key === "enableLegacyMutators") {
            writer.write(enableLegacyMutators ? "true" : "false");
          } else if (key === "enableLegacyQueries") {
            writer.write(enableLegacyQueries ? "true" : "false");
          } else {
            writeValue(writer, propValue, {
              keys: [...keys, key],
              indent: indent + 2,
              mode,
            });
          }

          if (i < entries.length - 1) {
            writer.write(",");
          }

          writer.newLine();
        }

        writer.write(indentStr);
      }

      writer.write("}");
      return;
    }

    const serialized = JSON.stringify(value);
    writer.write(serialized ?? "undefined");
  };

  let tableConstCount = 0;
  if (isRecord(result.zeroSchema?.tables)) {
    for (const [tableName, tableDef] of Object.entries(
      result.zeroSchema.tables as Record<string, unknown>,
    )) {
      const constName = createConstName(tableName, "Table", "table");
      tableConstNames.set(tableName, constName);

      if (tableConstCount > 0) {
        zeroSchemaGenerated.addStatements((writer) => writer.blankLine());
      }

      zeroSchemaGenerated.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: constName,
            initializer: (writer) => {
              writeValue(writer, tableDef, {
                keys: ["tables", tableName],
              });
              writer.write(" as const");
            },
          },
        ],
      });

      tableConstCount += 1;
    }
  }

  let relationshipConstCount = 0;
  if (isRecord(result.zeroSchema?.relationships)) {
    for (const [relationshipName, relationshipDef] of Object.entries(
      result.zeroSchema.relationships as Record<string, unknown>,
    )) {
      const constName = createConstName(
        relationshipName,
        "Relationships",
        "relationships",
      );
      relationshipConstNames.set(relationshipName, constName);

      if (relationshipConstCount === 0) {
        if (tableConstCount > 0) {
          zeroSchemaGenerated.addStatements((writer) => writer.blankLine());
        }
      } else {
        zeroSchemaGenerated.addStatements((writer) => writer.blankLine());
      }

      zeroSchemaGenerated.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: constName,
            initializer: (writer) => {
              writeValue(writer, relationshipDef, {
                keys: ["relationships", relationshipName],
              });
              writer.write(" as const");
            },
          },
        ],
      });

      relationshipConstCount += 1;
    }
  }

  const schemaVariable = zeroSchemaGenerated.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: schemaObjectName,
        initializer: (writer) => {
          writeValue(writer, result.zeroSchema, { mode: "schema" });
          writer.write(` as const`);
        },
      },
    ],
  });

  schemaVariable.addJsDoc({
    description:
      "\nThe Zero schema object.\nThis type is auto-generated from your Drizzle schema definition.",
  });

  const schemaTypeAlias = zeroSchemaGenerated.addTypeAlias({
    name: typename,
    isExported: true,
    type: `typeof ${schemaObjectName}`,
  });

  schemaTypeAlias.addJsDoc({
    description:
      "\nRepresents the Zero schema type.\nThis type is auto-generated from your Drizzle schema definition.",
  });

  // Add type exports for each table
  if (
    !skipTypes &&
    result.zeroSchema &&
    typeof result.zeroSchema === "object" &&
    "tables" in result.zeroSchema
  ) {
    const allTableNames = Object.keys(result.zeroSchema.tables);

    if (allTableNames.length > 0) {
      zeroSchemaGenerated.addImportDeclaration({
        moduleSpecifier: "@rocicorp/zero",
        namedImports: [{ name: "Row" }],
        isTypeOnly: true,
      });
    }

    for (const tableName of allTableNames) {
      // make the type name singular and camelCase
      const typeName = camelCase(pluralize.singular(tableName), {
        pascalCase: true,
      });

      const tableTypeAlias = zeroSchemaGenerated.addTypeAlias({
        name: typeName,
        isExported: true,
        type: `Row["${tableName}"]`,
      });

      tableTypeAlias.addJsDoc({
        description: `\nRepresents a row from the "${tableName}" table.\nThis type is auto-generated from your Drizzle schema definition.\n\n@deprecated Use Row["${tableName}"] instead from "@rocicorp/zero".`,
      });
    }
  }

  // Add builder export
  if (!skipBuilder) {
    zeroSchemaGenerated.addImportDeclaration({
      moduleSpecifier: "@rocicorp/zero",
      namedImports: [{ name: "createBuilder" }],
    });

    const zqlVariable = zeroSchemaGenerated.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      isExported: true,
      declarations: [
        {
          name: "zql",
          initializer: `createBuilder(${schemaObjectName})`,
        },
      ],
    });

    zqlVariable.addJsDoc({
      description:
        "\nRepresents the ZQL query builder.\nThis type is auto-generated from your Drizzle schema definition.",
    });

    const builderVariable = zeroSchemaGenerated.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      isExported: true,
      declarations: [
        {
          name: "builder",
          initializer: "zql",
        },
      ],
    });

    builderVariable.addJsDoc({
      description:
        "\nRepresents the Zero schema query builder.\nThis type is auto-generated from your Drizzle schema definition.\n\n@deprecated Use `zql` instead.",
    });
  }

  // Add module augmentation for default types
  if (!skipDeclare) {
    zeroSchemaGenerated.addStatements((writer) => {
      writer.write(`\n/** Defines the default types for Zero */\n`);
      writer.write(`declare module '@rocicorp/zero' {`);
      writer.write(`  interface DefaultTypes {`);
      writer.write(`    schema: ${typename};`);
      writer.write(`  }`);
      writer.write(`}`);
    });
  }

  if (readonlyJSONValueImported) {
    zeroSchemaGenerated.addImportDeclaration({
      moduleSpecifier: "@rocicorp/zero",
      namedImports: [{ name: "ReadonlyJSONValue" }],
      isTypeOnly: true,
    });
  }

  zeroSchemaGenerated.formatText();

  // organize imports
  const organizedImports = zeroSchemaGenerated.organizeImports();

  const file = organizedImports.getText();

  return `/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by drizzle-zero.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

${file}`;
}
