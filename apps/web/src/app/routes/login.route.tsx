import { createRoute } from "@tanstack/react-router";

import { LoginPage } from "@/pages/login";

import { redirectIfAuthenticated } from "./guest-guard";
import { rootRoute } from "./root.route";

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: ({ context }) => redirectIfAuthenticated(context.queryClient),
  component: LoginPage,
});
