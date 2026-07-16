import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

// For Node-runtime apps (e.g. apps/api): Node globals, `no-type-imports`
// preference, and assumes a single non-split `tsconfig.json` at the app root
// (`parserOptions.project: true` auto-discovers it per linted file).
// Wrapped in `defineConfig` (see base.ts) so the exported type stays
// `Linter.Config[]` when a consuming app spreads it into its own `defineConfig`.
export const node = defineConfig([
  { languageOptions: { globals: globals.node } },
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { project: true },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "no-type-imports",
          disallowTypeAnnotations: true,
          fixStyle: "separate-type-imports",
        },
      ],
    },
  },
]);
