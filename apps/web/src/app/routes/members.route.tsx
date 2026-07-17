import { createRoute } from "@tanstack/react-router";

import { MembersPage } from "@/pages/members";

import { workspaceLayoutRoute } from "./workspace-layout.route";

export const membersRoute = createRoute({
  getParentRoute: () => workspaceLayoutRoute,
  path: "/members",
  component: MembersPage,
});
