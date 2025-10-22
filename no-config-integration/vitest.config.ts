import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    hookTimeout: 60000,
  },
  plugins: [tsconfigPaths()],
});
