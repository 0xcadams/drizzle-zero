import * as fs from "node:fs/promises";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { discoverAllTsConfigs } from "../src/cli/tsconfig";

describe("discoverAllTsConfigs", () => {
  const tempDir = path.resolve(__dirname, "temp_tsconfigs");

  beforeEach(async () => {
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("should find a single tsconfig with no references", async () => {
    const rootPath = path.join(tempDir, "tsconfig.json");
    await fs.writeFile(rootPath, JSON.stringify({ compilerOptions: {} }));

    const result = await discoverAllTsConfigs(rootPath);
    expect(result).toEqual(new Set([rootPath]));
  });

  it("should find one level of project references", async () => {
    const rootPath = path.join(tempDir, "tsconfig.json");
    const libADir = path.join(tempDir, "libs", "lib-a");
    const libBDir = path.join(tempDir, "libs", "lib-b");
    const libAPath = path.join(libADir, "tsconfig.json");
    const libBPath = path.join(libBDir, "tsconfig.json");

    await fs.mkdir(libADir, { recursive: true });
    await fs.mkdir(libBDir, { recursive: true });

    await fs.writeFile(
      rootPath,
      JSON.stringify({
        references: [{ path: "./libs/lib-a" }, { path: "./libs/lib-b" }],
      }),
    );
    await fs.writeFile(libAPath, JSON.stringify({ compilerOptions: {} }));
    await fs.writeFile(libBPath, JSON.stringify({ compilerOptions: {} }));

    const result = await discoverAllTsConfigs(rootPath);
    expect(result).toEqual(new Set([rootPath, libAPath, libBPath]));
  });

  it("should handle multi-level nested project references", async () => {
    const rootPath = path.join(tempDir, "tsconfig.json");
    const appDir = path.join(tempDir, "apps", "my-app");
    const sharedUiDir = path.join(tempDir, "libs", "shared-ui");
    const utilsDir = path.join(tempDir, "libs", "utils");

    const appPath = path.join(appDir, "tsconfig.json");
    const sharedUiPath = path.join(sharedUiDir, "tsconfig.json");
    const utilsPath = path.join(utilsDir, "tsconfig.json");

    await fs.mkdir(appDir, { recursive: true });
    await fs.mkdir(sharedUiDir, { recursive: true });
    await fs.mkdir(utilsDir, { recursive: true });

    await fs.writeFile(
      rootPath,
      JSON.stringify({ references: [{ path: "./apps/my-app" }] }),
    );
    await fs.writeFile(
      appPath,
      JSON.stringify({ references: [{ path: "../../libs/shared-ui" }] }),
    );
    await fs.writeFile(
      sharedUiPath,
      JSON.stringify({ references: [{ path: "../utils" }] }),
    );
    await fs.writeFile(utilsPath, JSON.stringify({ compilerOptions: {} }));

    const result = await discoverAllTsConfigs(rootPath);
    expect(result).toEqual(
      new Set([rootPath, appPath, sharedUiPath, utilsPath]),
    );
  });

  it("should correctly handle circular references", async () => {
    const rootPath = path.join(tempDir, "tsconfig.json");
    const libADir = path.join(tempDir, "libs", "lib-a");
    const libBDir = path.join(tempDir, "libs", "lib-b");
    const libAPath = path.join(libADir, "tsconfig.json");
    const libBPath = path.join(libBDir, "tsconfig.json");

    await fs.mkdir(libADir, { recursive: true });
    await fs.mkdir(libBDir, { recursive: true });

    await fs.writeFile(
      rootPath,
      JSON.stringify({ references: [{ path: "./libs/lib-a" }] }),
    );
    await fs.writeFile(
      libAPath,
      JSON.stringify({ references: [{ path: "../lib-b" }] }),
    );
    await fs.writeFile(
      libBPath,
      JSON.stringify({ references: [{ path: "../lib-a" }] }),
    );

    const result = await discoverAllTsConfigs(rootPath);
    expect(result).toEqual(new Set([rootPath, libAPath, libBPath]));
  });

  it("should continue gracefully if a referenced tsconfig is not found", async () => {
    const rootPath = path.join(tempDir, "tsconfig.json");
    const libGoodDir = path.join(tempDir, "libs", "good");
    const libGoodPath = path.join(libGoodDir, "tsconfig.json");

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await fs.mkdir(libGoodDir, { recursive: true });

    await fs.writeFile(
      rootPath,
      JSON.stringify({
        references: [{ path: "./libs/good" }, { path: "./libs/bad" }],
      }),
    );
    await fs.writeFile(libGoodPath, JSON.stringify({ compilerOptions: {} }));

    const result = await discoverAllTsConfigs(rootPath);
    expect(result).toEqual(new Set([rootPath, libGoodPath]));

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Could not resolve reference path: ./libs/bad"),
    );

    warnSpy.mockRestore();
  });
});
