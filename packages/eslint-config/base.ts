import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import importX from "eslint-plugin-import-x";
import prettierPlugin from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

// Runtime-agnostic rules shared by every app: import ordering, general style,
// untyped `typescript-eslint` recommended rules, Prettier integration. Combine
// with `./node` or `./react` for the runtime-specific typed-checked block —
// those live in this same package (not in each app's own eslint.config.ts)
// specifically so `typescript-eslint` always resolves to a single instance;
// when the typed block used to live per-app, a version mismatch between an
// app's own `typescript-eslint` and this package's made ESLint throw
// "Cannot redefine plugin '@typescript-eslint'".
// Each consuming app's own `prettier` devDependency still must match this
// package's exactly (not just semver-compatible): pnpm links a distinct
// peer-hashed copy of `eslint-plugin-prettier` per unique `prettier` version
// found across the workspace, so a mismatched app-level `prettier` pin can
// silently make `prettier/prettier` lint using a different Prettier version/
// behavior than that app's own `prettier --check`/`--write`.
export const base = defineConfig([
  { ignores: ["dist/**", "coverage/**", "node_modules/**", "**/.prettierrc.cjs"] },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  tseslint.configs.recommended,
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "_" }],
      "@typescript-eslint/explicit-member-accessibility": ["error", { accessibility: "explicit" }],
    },
  },
  {
    rules: {
      complexity: ["warn", 10],
      "max-depth": ["warn", 4],
      "max-lines-per-function": "off",
      "max-params": ["warn", 4],
      "no-else-return": "warn",
      "no-console": "warn",
      eqeqeq: ["error", "always"],
      "no-return-await": "error",
      "accessor-pairs": ["warn", { setWithoutGet: true, getWithoutSet: false }],
    },
  },
  {
    plugins: { "import-x": importX },
    rules: {
      "sort-imports": ["error", { ignoreCase: true, ignoreDeclarationSort: true }],
      "import-x/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          pathGroups: [{ pattern: "@/**", group: "internal", position: "after" }],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import-x/first": "error",
      "import-x/newline-after-import": "error",
      "import-x/no-unresolved": "off",
    },
    settings: {
      "import-x/resolver": { typescript: true },
    },
  },
  prettierConfig,
  prettierPlugin,
]);
