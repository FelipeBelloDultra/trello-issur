import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { redirectIfAuthenticated } from "./guest-guard";
import { rootRoute } from "./root.route";

export const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  beforeLoad: ({ context }) => redirectIfAuthenticated(context.queryClient),
  component: lazyRouteComponent(() => import("@/pages/signup"), "SignupPage"),
});
