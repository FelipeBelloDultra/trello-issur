import { createRoute } from "@tanstack/react-router";

import { HomePage } from "@/pages/home";

import { workspaceLayoutRoute } from "./workspace-layout.route";

export const workspaceHomeRoute = createRoute({
  getParentRoute: () => workspaceLayoutRoute,
  path: "/",
  component: HomePage,
});
