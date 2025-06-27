import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";
import { Project } from "ts-morph";
import { tsImport } from "tsx/esm/api";
import type { DrizzleToZeroSchema } from "../relations";
import {
  parse as JsoncParse,
  type ParseError as JsoncParseError,
} from "jsonc-parser";

export const defaultConfigFilePath = "drizzle-zero.config.ts";

export const getDefaultConfigFilePath = async () => {
  const fullConfigPath = path.resolve(process.cwd(), defaultConfigFilePath);

  try {
    await fs.access(fullConfigPath);
  } catch (error) {
    return null;
  }

  return "drizzle-zero.config.ts";
};

export const getConfigFromFile = async ({
  configFilePath,
  tsProject,
}: {
  configFilePath: string;
  tsProject: Project;
}) => {
  const fullConfigPath = path.resolve(process.cwd(), configFilePath);

  try {
    await fs.access(fullConfigPath);
  } catch (error) {
    throw new Error(
      `❌ drizzle-zero: Failed to find config file at ${fullConfigPath}`,
    );
  }

  const zeroConfigFilePathUrl = url.pathToFileURL(fullConfigPath).href;
  const zeroConfigImport = await tsImport(
    zeroConfigFilePathUrl,
    import.meta.url,
  );
  const exportName = zeroConfigImport?.default ? "default" : "schema";
  const zeroSchema = zeroConfigImport?.default ?? zeroConfigImport?.schema;

  const typeDeclarations = await getZeroSchemaDefsFromConfig({
    tsProject,
    configPath: fullConfigPath,
    exportName,
  });

  return {
    type: "config",
    zeroSchema: zeroSchema as DrizzleToZeroSchema<any> | undefined,
    exportName,
    zeroSchemaTypeDeclarations: typeDeclarations,
  } as const;
};

export async function getZeroSchemaDefsFromConfig({
  tsProject,
  configPath,
  exportName,
}: {
  tsProject: Project;
  configPath: string;
  exportName: string;
}) {
  const fileName = configPath.slice(configPath.lastIndexOf("/") + 1);

  const sourceFile = tsProject.getSourceFile(fileName);

  if (!sourceFile) {
    throw new Error(
      `❌ drizzle-zero: Failed to find type definitions for ${fileName}`,
    );
  }

  const exportDeclarations = sourceFile.getExportedDeclarations();

  for (const [name, declarations] of exportDeclarations.entries()) {
    for (const declaration of declarations) {
      if (exportName === name) {
        return [name, declaration] as const;
      }
    }
  }

  throw new Error(
    `❌ drizzle-zero: No config type found in the config file - did you export \`default\` or \`schema\`? Found: ${sourceFile
      .getVariableDeclarations()
      .map((v) => v.getName())
      .join(", ")}`,
  );
}

export async function discoverAllTsConfigs(
  initialTsConfigPath: string,
): Promise<Set<string>> {
  const processedPaths = new Set<string>();
  const toProcess = [path.resolve(initialTsConfigPath)];

  const processTsConfig = async (tsConfigPath: string) => {
    if (processedPaths.has(tsConfigPath)) {
      return [];
    }
    processedPaths.add(tsConfigPath);

    try {
      const tsConfigContent = await fs.readFile(tsConfigPath, "utf-8");
      const errors: JsoncParseError[] = [];
      const tsConfig = JsoncParse(tsConfigContent, errors) as {
        references?: { path: string }[];
      };

      if (errors.length > 0) {
        console.warn(
          `⚠️  drizzle-zero: Found syntax errors in ${path.relative(process.cwd(), tsConfigPath)}. The resolver will attempt to continue.`,
        );
      }

      if (!tsConfig?.references) {
        return [];
      }

      const tsConfigDir = path.dirname(tsConfigPath);
      const newPathsToProcess: string[] = [];

      for (const ref of tsConfig.references) {
        const referencedTsConfigPath = await resolveReferencePath(
          ref.path,
          tsConfigDir,
        );

        if (
          referencedTsConfigPath &&
          !processedPaths.has(referencedTsConfigPath)
        ) {
          newPathsToProcess.push(referencedTsConfigPath);
        }
      }
      return newPathsToProcess;
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        console.warn(
          `⚠️  drizzle-zero: Could not find tsconfig file: ${tsConfigPath}`,
        );
      } else {
        throw new Error(
          `❌  drizzle-zero: Error processing tsconfig file: ${tsConfigPath}: ${error}`,
        );
      }
      return [];
    }
  };

  while (toProcess.length > 0) {
    const newPaths = (
      await Promise.all(toProcess.splice(0).map(processTsConfig))
    ).flat();
    if (newPaths.length > 0) {
      toProcess.push(...newPaths);
    }
  }

  return processedPaths;
}

async function resolveReferencePath(
  refPath: string,
  tsConfigDir: string,
): Promise<string | undefined> {
  const resolvedPath = path.resolve(tsConfigDir, refPath);

  // The reference can be a directory or a file.
  // We assume that if it's a directory, then it contains a 'tsconfig.json' file.
  try {
    const stats = await fs.stat(resolvedPath);
    if (stats.isDirectory()) {
      return path.join(resolvedPath, "tsconfig.json");
    }
    return resolvedPath;
  } catch {
    console.warn(
      `⚠️  drizzle-zero: Could not resolve reference path: ${refPath}`,
    );
    return;
  }
}
