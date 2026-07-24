import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import { bootstrapSession } from "@/entities/session";
import { RouteProgressBar } from "@/shared/ui/route-progress-bar";

import { AppBootSkeleton } from "../layouts/app-boot-skeleton";

import type { QueryClient } from "@tanstack/react-query";

export interface RouterContext {
  queryClient: QueryClient;
}

// Root beforeLoad runs before every route's own beforeLoad (guest or
// dashboard), so by the time either guard checks useAuthStore's status,
// bootstrapSession() has already resolved it — guards never need to await
// or trigger the check themselves, only read the store.
export const rootRoute = createRootRouteWithContext<RouterContext>()({
  beforeLoad: () => bootstrapSession(),
  pendingComponent: AppBootSkeleton,
  component: () => (
    <>
      <RouteProgressBar />
      <Outlet />
    </>
  ),
});
