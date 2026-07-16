import { defineConfig } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

// For Vite/React apps (e.g. apps/web): browser+node globals, react-hooks/
// react-refresh rules, `type-imports` preference (verbatimModuleSyntax
// requires it), and assumes the standard Vite tsconfig split where
// `tsconfig.app.json` holds the app's own compilerOptions/project.
// Wrapped in `defineConfig` (see base.ts) so the exported type stays
// `Linter.Config[]` when a consuming app spreads it into its own `defineConfig`.
export const react = defineConfig([
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { project: "./tsconfig.app.json" },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: true,
          fixStyle: "inline-type-imports",
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
]);
