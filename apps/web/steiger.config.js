import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ["./src/app/routes/**"],
    rules: {
      // Route files deep-import a page's pendingComponent skeleton (e.g.
      // "@/pages/home/ui/home-page-skeleton") instead of the page's index.ts.
      // This is deliberate: importing the skeleton via the same barrel that
      // lazyRouteComponent() dynamically imports collapses Rollup's code
      // splitting for that route (confirmed via `pnpm run build`'s
      // [INEFFECTIVE_DYNAMIC_IMPORT] warning) — the whole page's JS lands in
      // the eager bundle instead of its own chunk.
      "fsd/no-public-api-sidestep": "off",
    },
  },
]);
