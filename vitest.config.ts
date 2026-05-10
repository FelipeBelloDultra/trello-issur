import "dotenv/config";
import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    alias: [
      {
        find: "@",
        replacement: resolve(__dirname, "src"),
      },
    ],
    globals: true,
    coverage: {
      provider: "v8",
      include: [
        "src/modules/**/domain/**",
        "!src/core/entity/dto.ts",
        "src/modules/**/application/{subscribers,use-cases}/**",
        "!src/modules/**/application/use-cases/factories/**",
        "!src/modules/**/application/use-cases/dtos/**",
        "!src/modules/**/domain/events/**",
      ],
    },
    include: ["src/**/*.spec.ts", "!src/**/*.e2e.spec.ts"],
    setupFiles: ["/test/container/index.ts"],
  },
});
