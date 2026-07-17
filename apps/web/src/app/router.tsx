import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import { accountMeQueryOptions } from "@/entities/account";
import { workspaceMembershipQueryOptions, workspacesQueryOptions } from "@/entities/workspace";
import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { MembersPage } from "@/pages/members";
import { OnboardingPage } from "@/pages/onboarding";

import { DashboardLayout } from "./layouts/dashboard-layout";
import { WorkspaceLayout } from "./layouts/workspace-layout";
import { queryClient } from "./query-client";

import type { QueryClient } from "@tanstack/react-query";

interface RouterContext {
  queryClient: QueryClient;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});

// Pathless layout route: guards every authenticated page by confirming the
// httpOnly session cookie is valid (no client-held token to check anymore —
// this is a real server round-trip, not a decorative client check).
const dashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "dashboard-layout",
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(accountMeQueryOptions());
    } catch {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's documented throw-a-redirect pattern
      throw redirect({ to: "/login" });
    }
  },
  component: DashboardLayout,
});

// Landing route: picks the account's first workspace and redirects there, or
// shows the "create a workspace" empty state when the account has none yet.
const workspaceIndexRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/",
  loader: async ({ context }) => {
    const workspaces = await context.queryClient.ensureQueryData(workspacesQueryOptions());
    const first = workspaces[0];
    if (first) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's documented throw-a-redirect pattern
      throw redirect({ to: "/w/$workspaceId", params: { workspaceId: first.id } });
    }
  },
  component: OnboardingPage,
});

// Workspace-scoped layout: the sidebar only makes sense once a workspace is
// selected. beforeLoad confirms membership server-side and resolves the
// caller's role/permissions for THIS workspace, exposed to every child route
// via context — switching $workspaceId re-runs this (new query key) so
// permissions are always re-fetched fresh, never cached across workspaces.
const workspaceLayoutRoute = createRoute({
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

const workspaceHomeRoute = createRoute({
  getParentRoute: () => workspaceLayoutRoute,
  path: "/",
  component: HomePage,
});

const membersRoute = createRoute({
  getParentRoute: () => workspaceLayoutRoute,
  path: "/members",
  component: MembersPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([
  dashboardLayoutRoute.addChildren([
    workspaceIndexRoute,
    workspaceLayoutRoute.addChildren([workspaceHomeRoute, membersRoute]),
  ]),
  loginRoute,
]);

export const router = createRouter({ routeTree, context: { queryClient } });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
