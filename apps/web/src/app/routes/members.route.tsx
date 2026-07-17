import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { MembersPageSkeleton } from "@/pages/members";

import { workspaceLayoutRoute } from "./workspace-layout.route";

export const membersRoute = createRoute({
  getParentRoute: () => workspaceLayoutRoute,
  path: "/members",
  component: lazyRouteComponent(() => import("@/pages/members"), "MembersPage"),
  pendingComponent: MembersPageSkeleton,
});
