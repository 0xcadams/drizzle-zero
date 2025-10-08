import type { Config } from "drizzle-kit";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";
import type { Project } from "ts-morph";
import { tsImport } from "tsx/esm/api";
import { drizzleZeroConfig, type DrizzleToZeroSchema } from "../relations";
import { ensureSourceFileInProject } from "./ts-project";

export const getDefaultConfig = async ({
  drizzleSchemaPath,
  drizzleKitConfigPath,
  tsProject,
  debug,
}: {
  drizzleSchemaPath: string | undefined;
  drizzleKitConfigPath: string | undefined;
  tsProject: Project;
  debug?: boolean;
}) => {
  const {
    drizzleSchemaPath: resolvedDrizzleSchemaPath,
    casing: drizzleCasing,
  } = await getFullDrizzleSchemaFilePath({
    drizzleSchemaPath,
    drizzleKitConfigPath,
  });

  const resolvedDrizzleSchemaPathUrl = url.pathToFileURL(
    resolvedDrizzleSchemaPath,
  ).href;

  const drizzleSchema = await tsImport(
    resolvedDrizzleSchemaPathUrl,
    import.meta.url,
  );

  const zeroSchema = drizzleZeroConfig(drizzleSchema, {
    casing: drizzleCasing ?? undefined,
    debug: Boolean(debug),
  });

  ensureSourceFileInProject({
    tsProject,
    filePath: resolvedDrizzleSchemaPath,
    debug: Boolean(debug),
  });

  return {
    type: "drizzle-kit",
    zeroSchema: zeroSchema as DrizzleToZeroSchema<any> | undefined,
    drizzleSchemaSourceFile: await getDrizzleSchemaSourceFile({
      tsProject,
      drizzleSchemaPath: resolvedDrizzleSchemaPath,
    }),
    drizzleCasing,
  } as const;
};

export const getFullDrizzleSchemaFilePath = async ({
  drizzleKitConfigPath,
  drizzleSchemaPath,
}: {
  drizzleKitConfigPath: string | undefined;
  drizzleSchemaPath: string | undefined;
}) => {
  const typeModuleErrorMessage = `. You may need to add \` "type": "module" \` to your package.json.`;

  if (drizzleSchemaPath) {
    const fullPath = path.resolve(process.cwd(), drizzleSchemaPath);

    try {
      await fs.access(fullPath);

      return {
        drizzleSchemaPath: fullPath,
        casing: null,
      };
    } catch (error) {
      console.error(
        `❌ drizzle-zero: could not find Drizzle schema file at ${fullPath}`,
      );
      process.exit(1);
    }
  }

  if (drizzleKitConfigPath) {
    const fullPath = path.resolve(process.cwd(), drizzleKitConfigPath);

    try {
      await fs.access(fullPath);

      const drizzleKitConfigFilePathUrl = url.pathToFileURL(fullPath).href;
      const drizzleKitConfigImport = await tsImport(
        drizzleKitConfigFilePathUrl,
        import.meta.url,
      );

      const drizzleKitConfig = drizzleKitConfigImport?.default as Config;

      try {
        if (Array.isArray(drizzleKitConfig.schema)) {
          throw new Error(
            "❌ drizzle-zero: Drizzle Kit config schema is an array. Please specify a single schema file for imports to be able to work correctly.",
          );
        }

        if (drizzleKitConfig.schema) {
          const fullPath = path.resolve(process.cwd(), drizzleKitConfig.schema);

          await fs.access(fullPath);

          return {
            drizzleSchemaPath: fullPath,
            casing: drizzleKitConfig.casing ?? null,
          };
        }
      } catch (error) {
        console.error(
          `❌ drizzle-zero: could not find Drizzle file pulled from Drizzle Kit config at ${JSON.stringify(drizzleKitConfig)}`,
          error,
        );
        process.exit(1);
      }

      return {
        drizzleSchemaPath: fullPath,
        casing: drizzleKitConfig.casing ?? null,
      };
    } catch (error) {
      console.error(
        `❌ drizzle-zero: could not find Drizzle Kit config file at ${drizzleKitConfigPath}${typeModuleErrorMessage}`,
        error,
      );
      process.exit(1);
    }
  }

  console.error(`❌ drizzle-zero: could not find Drizzle Kit config file`);
  process.exit(1);
};

export async function getDrizzleSchemaSourceFile({
  tsProject,
  drizzleSchemaPath,
}: {
  tsProject: Project;
  drizzleSchemaPath: string;
}) {
  const sourceFile = tsProject.getSourceFile(drizzleSchemaPath);

  if (!sourceFile) {
    throw new Error(
      `❌ drizzle-zero: Failed to find type definitions for ${drizzleSchemaPath}`,
    );
  }

  return sourceFile;
}
