import { createRouter, lazyRouteComponent } from "@tanstack/react-router";

import { queryClient } from "./query-client";
import { routeTree } from "./routes";

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultNotFoundComponent: lazyRouteComponent(() => import("@/pages/not-found"), "NotFoundPage"),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
