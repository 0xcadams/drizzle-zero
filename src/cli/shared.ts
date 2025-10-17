import camelCase from "camelcase";
import pluralize from "pluralize";
import { type Project, VariableDeclarationKind } from "ts-morph";
import type { getConfigFromFile } from "./config";
import type { getDefaultConfig } from "./drizzle-kit";

export async function getGeneratedSchema({
  tsProject,
  result,
  outputFilePath,
  jsExtensionOverride = "auto",
  skipTypes = false,
  skipBuilder = false,
  disableLegacyMutators = false,
  disableLegacyQueries = false,
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
  disableLegacyMutators?: boolean;
  disableLegacyQueries?: boolean;
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

  zeroSchemaGenerated.addImportDeclaration({
    moduleSpecifier: "drizzle-zero",
    namedImports: [{ name: "ZeroCustomType" }],
    isTypeOnly: true,
  });

  let zeroSchemaSpecifier: string | undefined;

  if (result.type === "config") {
    const moduleSpecifier =
      zeroSchemaGenerated.getRelativePathAsModuleSpecifierTo(
        result.zeroSchemaTypeDeclarations[1].getSourceFile(),
      );

    // Add import for DrizzleConfigSchema
    zeroSchemaGenerated.addImportDeclaration({
      moduleSpecifier: needsJsExtension
        ? `${moduleSpecifier}.js`
        : moduleSpecifier,
      namedImports: [{ name: result.exportName, alias: "zeroSchema" }],
      isTypeOnly: true,
    });

    zeroSchemaSpecifier = "typeof zeroSchema";
  } else {
    const moduleSpecifier =
      zeroSchemaGenerated.getRelativePathAsModuleSpecifierTo(
        result.drizzleSchemaSourceFile,
      );

    zeroSchemaGenerated.addImportDeclaration({
      moduleSpecifier: needsJsExtension
        ? `${moduleSpecifier}.js`
        : moduleSpecifier,
      namespaceImport: "drizzleSchema",
      isTypeOnly: true,
    });

    // Add import for DrizzleToZeroSchema type
    zeroSchemaGenerated.addImportDeclaration({
      moduleSpecifier: "drizzle-zero",
      namedImports: [{ name: "DrizzleToZeroSchema" }],
      isTypeOnly: true,
    });

    zeroSchemaGenerated.addTypeAlias({
      name: "ZeroSchema",
      isExported: false,
      type: `DrizzleToZeroSchema<typeof drizzleSchema>`,
    });

    zeroSchemaSpecifier = "ZeroSchema";
  }

  const schemaVariable = zeroSchemaGenerated.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: schemaObjectName,
        initializer: (writer) => {
          const writeValue = (
            value: unknown,
            keys: string[] = [],
            indent = 0,
          ) => {
            const indentStr = " ".repeat(indent);

            if (
              !value ||
              typeof value === "string" ||
              typeof value === "number" ||
              typeof value === "boolean" ||
              Array.isArray(value)
            ) {
              writer.write(JSON.stringify(value));
            } else if (typeof value === "object" && value !== null) {
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

                  // Special handling for customType: null
                  if (key === "customType" && propValue === null) {
                    const tableIndex = 1;
                    const columnIndex = 3;

                    writer.write(
                      `null as unknown as ZeroCustomType<${zeroSchemaSpecifier}, "${keys[tableIndex]}", "${keys[columnIndex]}">`,
                    );
                  } else if (key === "enableLegacyMutators") {
                    writer.write(disableLegacyMutators ? "false" : "true");
                  } else if (key === "enableLegacyQueries") {
                    writer.write(disableLegacyQueries ? "false" : "true");
                  } else {
                    writeValue(propValue, [...keys, key], indent + 2);
                  }

                  if (i < entries.length - 1) {
                    writer.write(",");
                  }

                  writer.newLine();
                }

                writer.write(indentStr);
              }

              writer.write("}");
            }
          };

          writeValue(result.zeroSchema);
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
        type: `Row<${typename}["tables"]["${tableName}"]>`,
      });

      tableTypeAlias.addJsDoc({
        description: `\nRepresents a row from the "${tableName}" table.\nThis type is auto-generated from your Drizzle schema definition.`,
      });
    }
  }

  // Add builder export
  if (!skipBuilder) {
    zeroSchemaGenerated.addImportDeclaration({
      moduleSpecifier: "@rocicorp/zero",
      namedImports: [{ name: "createBuilder" }],
    });

    const builderVariable = zeroSchemaGenerated.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      isExported: true,
      declarations: [
        {
          name: "builder",
          initializer: `createBuilder(${schemaObjectName})`,
        },
      ],
    });

    builderVariable.addJsDoc({
      description:
        "\nRepresents the Zero schema query builder.\nThis type is auto-generated from your Drizzle schema definition.",
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
