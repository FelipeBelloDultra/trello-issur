import { createRoute, redirect } from "@tanstack/react-router";

import { workspaceMembershipQueryOptions } from "@/entities/workspace";

import { WorkspaceLayout } from "../layouts/workspace-layout";

import { dashboardLayoutRoute } from "./dashboard-layout.route";

// Workspace-scoped layout: the sidebar only makes sense once a workspace is
// selected. beforeLoad confirms membership server-side and resolves the
// caller's role/permissions for THIS workspace, exposed to every child route
// via context — switching $workspaceId re-runs this (new query key) so
// permissions are always re-fetched fresh, never cached across workspaces.
export const workspaceLayoutRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/w/$workspaceId",
  beforeLoad: async ({ context, params }) => {
    try {
      const membership = await context.queryClient.ensureQueryData(
        workspaceMembershipQueryOptions(params.workspaceId),
      );
      return membership;
    } catch {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's documented throw-a-redirect pattern
      throw redirect({ to: "/" });
    }
  },
  component: WorkspaceLayout,
});
