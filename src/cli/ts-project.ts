import type { Project, SourceFile } from "ts-morph";

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
        `⚠️  drizzle-zero: Could not load ${filePath} into the TypeScript project.`,
        error,
      );
    }
    return;
  }
}
