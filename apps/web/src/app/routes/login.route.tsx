import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { redirectIfAuthenticated } from "./guest-guard";
import { rootRoute } from "./root.route";

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: ({ context }) => redirectIfAuthenticated(context.queryClient),
  component: lazyRouteComponent(() => import("@/pages/login"), "LoginPage"),
});
