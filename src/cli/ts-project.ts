import * as path from "node:path";
import type { Project, SourceFile } from "ts-morph";

export function ensureSourceFileInProject({
  tsProject,
  filePath,
  debug = false,
  label,
}: {
  tsProject: Project;
  filePath: string;
  debug?: boolean;
  label?: string;
}): SourceFile | undefined {
  const resolvedPath = path.resolve(process.cwd(), filePath);
  const posixPath = resolvedPath.split(path.sep).join(path.posix.sep);
  const shortLabel = label ?? resolvedPath;

  const existingSourceFile =
    tsProject.getSourceFile(posixPath) ??
    tsProject.getSourceFile(resolvedPath) ??
    tsProject.addSourceFileAtPathIfExists(resolvedPath);

  if (existingSourceFile) {
    return existingSourceFile;
  }

  try {
    return tsProject.addSourceFileAtPath(resolvedPath);
  } catch (error) {
    if (debug) {
      console.warn(
        `⚠️  drizzle-zero: Could not load ${shortLabel} (${resolvedPath}) into the TypeScript project.`,
        error,
      );
    }
    return;
  }
}
