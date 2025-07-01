import { Command } from "commander";
import {
  parse as JsoncParse,
  type ParseError as JsoncParseError,
} from "jsonc-parser";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { Project } from "ts-morph";
import { getConfigFromFile, getDefaultConfigFilePath } from "./config";
import { getDefaultConfig } from "./drizzle-kit";
import { getGeneratedSchema } from "./shared";

const defaultConfigFile = "./drizzle-zero.config.ts";
const defaultOutputFile = "./zero-schema.gen.ts";
const defaultTsConfigFile = "./tsconfig.json";
const defaultDrizzleKitConfigPath = "./drizzle.config.ts";

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

export async function loadPrettier() {
  try {
    return await import("prettier");
  } catch (_) {}

  try {
    const path = require.resolve("prettier", { paths: [process.cwd()] });
    return await import(pathToFileURL(path).href);
  } catch {
    throw new Error(
      "⚠️  drizzle-zero: prettier could not be found. Install it locally with\n  npm i -D prettier",
    );
  }
}

export async function formatSchema(schema: string): Promise<string> {
  try {
    const prettier = await loadPrettier();
    return prettier.format(schema, {
      parser: "typescript",
    });
  } catch (error) {
    console.warn("⚠️  drizzle-zero: prettier not found, skipping formatting");
    return schema;
  }
}

export interface GeneratorOptions {
  config?: string;
  tsConfigPath?: string;
  format?: boolean;
  outputFilePath?: string;
  drizzleSchemaPath?: string;
  drizzleKitConfigPath?: string;
  debug?: boolean;
  jsFileExtension?: boolean;
}

async function main(opts: GeneratorOptions = {}) {
  const {
    config,
    tsConfigPath,
    format,
    outputFilePath,
    drizzleSchemaPath,
    drizzleKitConfigPath,
    debug,
    jsFileExtension,
  } = { ...opts };

  const resolvedTsConfigPath = tsConfigPath ?? defaultTsConfigFile;
  const resolvedOutputFilePath = outputFilePath ?? defaultOutputFile;

  const defaultConfigFilePath = await getDefaultConfigFilePath();

  const configFilePath = config ?? defaultConfigFilePath;

  if (!configFilePath) {
    console.log(
      "😶‍🌫️  drizzle-zero: Using all tables/columns from Drizzle schema",
    );
  }
  const allTsConfigPaths = await discoverAllTsConfigs(resolvedTsConfigPath);

  const tsProject = new Project({
    tsConfigFilePath: resolvedTsConfigPath,
    skipAddingFilesFromTsConfig: true,
  });
  for (const tsConfigPath of allTsConfigPaths) {
    tsProject.addSourceFilesFromTsConfig(tsConfigPath);
  }

  const result = configFilePath
    ? await getConfigFromFile({
        configFilePath,
        tsProject,
      })
    : await getDefaultConfig({
        drizzleSchemaPath,
        drizzleKitConfigPath,
        tsProject,
        debug: Boolean(debug),
      });

  if (!result?.zeroSchema) {
    console.error(
      "❌ drizzle-zero: No config found in the config file - did you export `default` or `schema`?",
    );
    process.exit(1);
  }

  if (Object.keys(result?.zeroSchema?.tables ?? {}).length === 0) {
    console.error("❌ drizzle-zero: No tables found in the output - was?");
    process.exit(1);
  }

  let zeroSchemaGenerated = await getGeneratedSchema({
    tsProject,
    result,
    outputFilePath: resolvedOutputFilePath,
    jsFileExtension: Boolean(jsFileExtension),
  });

  if (format) {
    zeroSchemaGenerated = await formatSchema(zeroSchemaGenerated);
  }

  return zeroSchemaGenerated;
}

async function cli() {
  const program = new Command();
  program
    .name("drizzle-zero")
    .description("The CLI for converting Drizzle ORM schemas to Zero schemas");

  program
    .command("generate")
    .option(
      "-c, --config <input-file>",
      `Path to the ${defaultConfigFile} configuration file`,
    )
    .option("-s, --schema <input-file>", `Path to the Drizzle schema file`)
    .option(
      "-k, --drizzle-kit-config <input-file>",
      `Path to the Drizzle Kit config file`,
      defaultDrizzleKitConfigPath,
    )
    .option(
      "-o, --output <output-file>",
      `Path to the generated output file`,
      defaultOutputFile,
    )
    .option(
      "-t, --tsconfig <tsconfig-file>",
      `Path to the custom tsconfig file`,
      defaultTsConfigFile,
    )
    .option("-f, --format", `Format the generated schema`, false)
    .option("-d, --debug", `Enable debug mode`)
    .option(
      "-j, --js-file-extension",
      `Add a .js file extension to the output (for usage without \"bundler\" module resolution)`,
      false,
    )
    .action(async (command) => {
      console.log(`⚙️  drizzle-zero: Generating zero schema...`);

      const zeroSchema = await main({
        config: command.config,
        tsConfigPath: command.tsconfig,
        format: command.format,
        outputFilePath: command.output,
        drizzleSchemaPath: command.schema,
        drizzleKitConfigPath: command.drizzleKitConfig,
        debug: command.debug,
        jsFileExtension: command.jsFileExtension,
      });

      if (command.output) {
        const outputPath = path.resolve(process.cwd(), command.output);
        await fs.writeFile(outputPath, zeroSchema);
        console.log(`✅ drizzle-zero: Zero schema written to ${outputPath}`);
      } else {
        console.log(zeroSchema);
      }
    });

  program.parse();
}

// Run the main function
cli().catch((error) => {
  console.error("❌ drizzle-zero error:", error);
  process.exit(1);
});
