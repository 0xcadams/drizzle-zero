import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 30000,
    hookTimeout: 30000,
    include: ["tests/**/*.test.ts"],
    typecheck: {
      enabled: true,
      tsconfig: "tsconfig.json",
      include: ["tests/**/*.test.ts"],
    },
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/cli/index.ts"],
      thresholds: {
        lines: 85,
        statements: 85,
        functions: 85,
        branches: 85,
      },
    },
    fileParallelism: true,
  },
  plugins: [tsconfigPaths()],
});
