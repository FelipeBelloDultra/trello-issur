import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

// Deliberately deep-imported, not via the pages/members public API — see the
// matching comment in workspace-home.route.tsx.
import { MembersPageSkeleton } from "@/pages/members/ui/members-page-skeleton";

import { workspaceLayoutRoute } from "./workspace-layout.route";

export const membersRoute = createRoute({
  getParentRoute: () => workspaceLayoutRoute,
  path: "/members",
  component: lazyRouteComponent(() => import("@/pages/members"), "MembersPage"),
  pendingComponent: MembersPageSkeleton,
});
