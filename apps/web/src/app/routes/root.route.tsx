import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import { RouteProgressBar } from "@/shared/ui/route-progress-bar";

import type { QueryClient } from "@tanstack/react-query";

export interface RouterContext {
  queryClient: QueryClient;
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <RouteProgressBar />
      <Outlet />
    </>
  ),
});
