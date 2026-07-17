import { createRoute } from "@tanstack/react-router";

import { SignupPage } from "@/pages/signup";

import { redirectIfAuthenticated } from "./guest-guard";
import { rootRoute } from "./root.route";

export const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  beforeLoad: ({ context }) => redirectIfAuthenticated(context.queryClient),
  component: SignupPage,
});
