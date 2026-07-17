import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { HomePageSkeleton } from "@/pages/home";

import { workspaceLayoutRoute } from "./workspace-layout.route";

export const workspaceHomeRoute = createRoute({
  getParentRoute: () => workspaceLayoutRoute,
  path: "/",
  component: lazyRouteComponent(() => import("@/pages/home"), "HomePage"),
  pendingComponent: HomePageSkeleton,
});
