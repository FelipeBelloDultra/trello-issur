import "dotenv/config";
import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@/test",
        replacement: resolve(__dirname, "test"),
      },
      {
        find: "@",
        replacement: resolve(__dirname, "src"),
      },
    ],
  },
  test: {
    globals: true,
    include: ["src/**/*.spec.ts", "!src/**/*.e2e.spec.ts"],
    setupFiles: ["/test/container/index.ts"],
  },
});
