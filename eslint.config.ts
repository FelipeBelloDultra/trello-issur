import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import importX from "eslint-plugin-import-x";
import prettierPlugin from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  { ignores: ["dist/**", "coverage/**", "node_modules/**"] },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.recommended,
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
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "_" }],
      "@typescript-eslint/explicit-member-accessibility": ["error", { accessibility: "explicit" }],
    },
  },
  {
    rules: {
      complexity: ["warn", 10],
      "max-depth": ["warn", 4],
      "max-lines-per-function": ["warn", { max: 50, skipBlankLines: true, skipComments: true }],
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
