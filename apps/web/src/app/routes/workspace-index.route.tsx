import { createRoute, lazyRouteComponent, redirect } from "@tanstack/react-router";

import { workspacesQueryOptions } from "@/entities/workspace";
// Deliberately deep-imported, not via the pages/onboarding public API — see
// the matching comment in workspace-home.route.tsx.
import { OnboardingPageSkeleton } from "@/pages/onboarding/ui/onboarding-page-skeleton";

import { dashboardLayoutRoute } from "./dashboard-layout.route";

// Landing route: picks the account's first workspace and redirects there, or
// shows the "create a workspace" empty state when the account has none yet.
export const workspaceIndexRoute = createRoute({
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
  component: lazyRouteComponent(() => import("@/pages/onboarding"), "OnboardingPage"),
  pendingComponent: OnboardingPageSkeleton,
});
