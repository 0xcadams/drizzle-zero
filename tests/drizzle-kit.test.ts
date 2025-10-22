import * as fs from "node:fs/promises";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFullDrizzleSchemaFilePath } from "../src/cli/drizzle-kit";

describe("getFullDrizzleSchemaFilePath", () => {
  const tempDir = path.resolve(__dirname, "temp_drizzle_kit");

  beforeEach(async () => {
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("should resolve drizzleSchemaPath when file exists", async () => {
    const schemaPath = path.join(tempDir, "schema.ts");
    await fs.writeFile(schemaPath, "export const schema = {};");

    const result = await getFullDrizzleSchemaFilePath({
      drizzleSchemaPath: schemaPath,
      drizzleKitConfigPath: undefined,
    });

    expect(result.drizzleSchemaPath).toBe(schemaPath);
    expect(result.casing).toBe(null);
  });

  it("should exit with error when drizzleSchemaPath does not exist", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const nonExistentPath = path.join(tempDir, "non-existent.ts");

    await expect(
      getFullDrizzleSchemaFilePath({
        drizzleSchemaPath: nonExistentPath,
        drizzleKitConfigPath: undefined,
      }),
    ).rejects.toThrow("process.exit");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("could not find Drizzle schema file"),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should exit with error when drizzleKitConfigPath does not exist", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const nonExistentConfig = path.join(tempDir, "non-existent-config.ts");

    await expect(
      getFullDrizzleSchemaFilePath({
        drizzleSchemaPath: undefined,
        drizzleKitConfigPath: nonExistentConfig,
      }),
    ).rejects.toThrow("process.exit");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("could not find Drizzle Kit config file"),
      expect.anything(),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should exit with error when both paths are undefined", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(
      getFullDrizzleSchemaFilePath({
        drizzleSchemaPath: undefined,
        drizzleKitConfigPath: undefined,
      }),
    ).rejects.toThrow("process.exit");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("could not find Drizzle Kit config file"),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should resolve schema from drizzle-kit config when provided", async () => {
    const schemaPath = path.join(tempDir, "schema.ts");
    const configPath = path.join(tempDir, "drizzle.config.ts");

    await fs.writeFile(schemaPath, "export const schema = {};");
    await fs.writeFile(
      configPath,
      `
      export default {
        schema: "${schemaPath}",
        casing: "snake_case"
      };
    `,
    );

    const result = await getFullDrizzleSchemaFilePath({
      drizzleSchemaPath: undefined,
      drizzleKitConfigPath: configPath,
    });

    expect(result.drizzleSchemaPath).toBe(schemaPath);
    expect(result.casing).toBe("snake_case");
  });

  it("should exit with error when schema in drizzle-kit config is an array", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const configPath = path.join(tempDir, "drizzle.config.ts");

    await fs.writeFile(
      configPath,
      `
      export default {
        schema: ["./schema1.ts", "./schema2.ts"]
      };
    `,
    );

    await expect(
      getFullDrizzleSchemaFilePath({
        drizzleSchemaPath: undefined,
        drizzleKitConfigPath: configPath,
      }),
    ).rejects.toThrow();

    exitSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should exit with error when schema file from drizzle-kit config does not exist", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const nonExistentSchemaPath = path.join(tempDir, "non-existent-schema.ts");
    const configPath = path.join(tempDir, "drizzle.config.ts");

    await fs.writeFile(
      configPath,
      `
      export default {
        schema: "${nonExistentSchemaPath}"
      };
    `,
    );

    await expect(
      getFullDrizzleSchemaFilePath({
        drizzleSchemaPath: undefined,
        drizzleKitConfigPath: configPath,
      }),
    ).rejects.toThrow("process.exit");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("could not find Drizzle file"),
      expect.anything(),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should return config path when schema is not provided in drizzle-kit config", async () => {
    const configPath = path.join(tempDir, "drizzle.config.ts");

    await fs.writeFile(
      configPath,
      `
      export default {
        casing: "camelCase"
      };
    `,
    );

    const result = await getFullDrizzleSchemaFilePath({
      drizzleSchemaPath: undefined,
      drizzleKitConfigPath: configPath,
    });

    expect(result.drizzleSchemaPath).toBe(configPath);
    expect(result.casing).toBe("camelCase");
  });
});
