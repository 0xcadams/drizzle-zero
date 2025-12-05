import {
  parse as JsoncParse,
  type ParseError as JsoncParseError,
} from 'jsonc-parser';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export async function resolveReferencePath(
  refPath: string,
  tsConfigDir: string,
): Promise<string | undefined> {
  const resolvedPath = path.resolve(tsConfigDir, refPath);

  // The reference can be a directory or a file.
  // We assume that if it's a directory, then it contains a 'tsconfig.json' file.
  try {
    const stats = await fs.stat(resolvedPath);
    if (stats.isDirectory()) {
      return path.join(resolvedPath, 'tsconfig.json');
    }
    return resolvedPath;
  } catch {
    console.warn(
      `⚠️  zero-drizzle: Could not resolve reference path: ${refPath}`,
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
      const tsConfigContent = await fs.readFile(tsConfigPath, 'utf-8');
      const errors: JsoncParseError[] = [];
      const tsConfig = JsoncParse(tsConfigContent, errors) as {
        references?: {path: string}[];
      };

      if (errors.length > 0) {
        console.warn(
          `⚠️  zero-drizzle: Found syntax errors in ${path.relative(process.cwd(), tsConfigPath)}. The resolver will attempt to continue.`,
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
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        console.warn(
          `⚠️  zero-drizzle: Could not find tsconfig file: ${tsConfigPath}`,
        );
      } else {
        throw new Error(
          `❌  zero-drizzle: Error processing tsconfig file: ${tsConfigPath}: ${error}`,
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
