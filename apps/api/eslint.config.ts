import { base } from "@trello-issur/eslint-config/base";
import { node } from "@trello-issur/eslint-config/node";
import { defineConfig } from "eslint/config";

export default defineConfig([
  ...base,
  ...node,
  {
    files: ["**/*.spec.ts", "**/*.e2e.spec.ts"],
    rules: {
      "max-lines-per-function": "off",
    },
  },
]);
