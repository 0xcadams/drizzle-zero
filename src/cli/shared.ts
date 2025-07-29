import { type Project, VariableDeclarationKind } from "ts-morph";
import type { getConfigFromFile } from "./config";
import type { getDefaultConfig } from "./drizzle-kit";

export async function getGeneratedSchema({
  tsProject,
  result,
  outputFilePath,
  jsFileExtension = false,
}: {
  tsProject: Project;
  result:
    | Awaited<ReturnType<typeof getConfigFromFile>>
    | Awaited<ReturnType<typeof getDefaultConfig>>;
  outputFilePath: string;
  jsFileExtension?: boolean;
}) {
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
      moduleSpecifier: jsFileExtension
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
      moduleSpecifier: jsFileExtension
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

  zeroSchemaGenerated.formatText();

  const file = zeroSchemaGenerated.getText();

  return `/* eslint-disable */
/* tslint:disable */
// noinspection JSUnusedGlobalSymbols
// biome-ignore-all
/*
 * ------------------------------------------------------------
 * ## This file was automatically generated by drizzle-zero. ##
 * ## Any changes you make to this file will be overwritten. ##
 * ##                                                        ##
 * ## Additionally, you should also exclude this file from   ##
 * ## your linter and/or formatter to prevent it from being  ##
 * ## checked or modified.                                   ##
 * ##                                                        ##
 * ## SOURCE: https://github.com/0xcadams/drizzle-zero        ##
 * ------------------------------------------------------------
 */

${file}`;
}
