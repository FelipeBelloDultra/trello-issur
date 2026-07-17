import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

// Deliberately deep-imported (not via the pages/home public API): importing
// the skeleton through the same barrel as the lazy-loaded HomePage collapses
// Rollup's code-splitting for that chunk (it sees one static + one dynamic
// import of the same specifier and just inlines it into the main bundle —
// confirmed via `pnpm run build`'s [INEFFECTIVE_DYNAMIC_IMPORT] warning).
import { HomePageSkeleton } from "@/pages/home/ui/home-page-skeleton";

import { workspaceLayoutRoute } from "./workspace-layout.route";

export const workspaceHomeRoute = createRoute({
  getParentRoute: () => workspaceLayoutRoute,
  path: "/",
  component: lazyRouteComponent(() => import("@/pages/home"), "HomePage"),
  pendingComponent: HomePageSkeleton,
});
