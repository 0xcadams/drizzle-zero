import * as path from "node:path";
import { Project } from "ts-morph";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ensureSourceFileInProject } from "../src/cli/ts-project";

describe("ensureSourceFileInProject", () => {
  let tsProject: Project;

  beforeEach(() => {
    tsProject = new Project({
      tsConfigFilePath: path.resolve(__dirname, "../tsconfig.json"),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return existing source file if already in project", () => {
    const filePath = path.resolve(__dirname, "../src/index.ts");

    // Add the file first
    tsProject.addSourceFileAtPathIfExists(filePath);

    const result = ensureSourceFileInProject({
      tsProject,
      filePath,
      debug: false,
    });

    expect(result).toBeDefined();
    expect(result?.getFilePath()).toBe(filePath);
  });

  it("should add source file if it exists but not in project", () => {
    const filePath = path.resolve(__dirname, "../src/relations.ts");

    const result = ensureSourceFileInProject({
      tsProject,
      filePath,
      debug: false,
    });

    expect(result).toBeDefined();
    expect(result?.getFilePath()).toBe(filePath);
  });

  it("should return undefined and warn when file cannot be added (debug mode)", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const nonExistentPath = path.resolve(__dirname, "non-existent-file.ts");

    const result = ensureSourceFileInProject({
      tsProject,
      filePath: nonExistentPath,
      debug: true,
    });

    expect(result).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Could not load"),
      expect.anything(),
    );

    warnSpy.mockRestore();
  });

  it("should return undefined without warning when file cannot be added (non-debug mode)", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const nonExistentPath = path.resolve(__dirname, "non-existent-file.ts");

    const result = ensureSourceFileInProject({
      tsProject,
      filePath: nonExistentPath,
      debug: false,
    });

    expect(result).toBeUndefined();
    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it("should handle file path that exists in filesystem but causes ts-morph error", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Mock both methods to ensure we hit the error case
    const getSourceFileSpy = vi
      .spyOn(tsProject, "getSourceFile")
      .mockReturnValue(undefined);
    const addSourceFileAtPathIfExistsSpy = vi
      .spyOn(tsProject, "addSourceFileAtPathIfExists")
      .mockReturnValue(undefined);
    const addSourceFileAtPathSpy = vi
      .spyOn(tsProject, "addSourceFileAtPath")
      .mockImplementation(() => {
        throw new Error("Mock ts-morph error");
      });

    const filePath = path.resolve(__dirname, "../src/index.ts");

    const result = ensureSourceFileInProject({
      tsProject,
      filePath,
      debug: true,
    });

    expect(result).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Could not load"),
      expect.any(Error),
    );

    getSourceFileSpy.mockRestore();
    addSourceFileAtPathIfExistsSpy.mockRestore();
    addSourceFileAtPathSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
