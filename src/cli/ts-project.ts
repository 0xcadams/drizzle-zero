import type {Project, SourceFile} from 'ts-morph';

const PERMISSION_ERROR_CODES = new Set(['EACCES', 'EPERM']);

function isFsPermissionError(error: unknown): error is NodeJS.ErrnoException {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as NodeJS.ErrnoException).code === 'string' &&
    PERMISSION_ERROR_CODES.has((error as NodeJS.ErrnoException).code ?? '')
  );
}

export function addSourceFilesFromTsConfigSafe({
  tsProject,
  tsConfigPath,
  debug = false,
}: {
  tsProject: Pick<Project, 'addSourceFilesFromTsConfig'>;
  tsConfigPath: string;
  debug?: boolean;
}): boolean {
  try {
    tsProject.addSourceFilesFromTsConfig(tsConfigPath);
    return true;
  } catch (error) {
    if (isFsPermissionError(error)) {
      const pathInfo = error.path ? ` while reading ${error.path}` : '';
      console.warn(
        `⚠️  zero-drizzle: Skipping files from ${tsConfigPath} due to a permission error${pathInfo} (${error.code}).`,
      );
      if (debug) {
        console.warn(error);
      }
      return false;
    }

    throw error;
  }
}

export function ensureSourceFileInProject({
  tsProject,
  filePath,
  debug,
}: {
  tsProject: Project;
  filePath: string;
  debug: boolean;
}): SourceFile | undefined {
  const existingSourceFile =
    tsProject.getSourceFile(filePath) ??
    tsProject.addSourceFileAtPathIfExists(filePath);

  if (existingSourceFile) {
    return existingSourceFile;
  }

  try {
    return tsProject.addSourceFileAtPath(filePath);
  } catch (error) {
    if (debug) {
      console.warn(
        `⚠️  zero-drizzle: Could not load ${filePath} into the TypeScript project.`,
        error,
      );
    }
    return;
  }
}
