import { Command } from "commander";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { Project } from "ts-morph";
import { getConfigFromFile, getDefaultConfigFilePath } from "./config";
import { getDefaultConfig } from "./drizzle-kit";
import { getGeneratedSchema } from "./shared";
import { discoverAllTsConfigs } from "./tsconfig";
import { ensureSourceFileInProject } from "./ts-project";

const defaultConfigFile = "./drizzle-zero.config.ts";
const defaultOutputFile = "./zero-schema.gen.ts";
const defaultTsConfigFile = "./tsconfig.json";
const defaultDrizzleKitConfigPath = "./drizzle.config.ts";

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
  skipTypes?: boolean;
  skipBuilder?: boolean;
  disableLegacyMutators?: boolean;
  disableLegacyQueries?: boolean;
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
    skipTypes,
    skipBuilder,
    disableLegacyMutators,
    disableLegacyQueries,
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

  if (configFilePath) {
    ensureSourceFileInProject({
      tsProject,
      filePath: path.resolve(process.cwd(), configFilePath),
      debug: Boolean(debug),
    });
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
    console.error(
      "❌ drizzle-zero: No tables found in the Zero schema - did you export tables and relations from the input Drizzle schema?",
    );
    process.exit(1);
  }

  let zeroSchemaGenerated = await getGeneratedSchema({
    tsProject,
    result,
    outputFilePath: resolvedOutputFilePath,
    jsFileExtension: Boolean(jsFileExtension),
    skipTypes: Boolean(skipTypes),
    skipBuilder: Boolean(skipBuilder),
    disableLegacyMutators: Boolean(disableLegacyMutators),
    disableLegacyQueries: Boolean(disableLegacyQueries),
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
    .option("--skip-types", "Skip generating table Row<> type exports", false)
    .option("--skip-builder", "Skip generating the builder export", false)
    .option(
      "--disable-legacy-mutators",
      "Disable legacy CRUD mutators (sets enableLegacyMutators to false)",
      false,
    )
    .option(
      "--disable-legacy-queries",
      "Disable legacy CRUD queries (sets enableLegacyQueries to false)",
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
        skipTypes: command.skipTypes,
        skipBuilder: command.skipBuilder,
        disableLegacyMutators: command.disableLegacyMutators,
        disableLegacyQueries: command.disableLegacyQueries,
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
