import { createRoute, redirect } from "@tanstack/react-router";

import { accountMeQueryOptions } from "@/entities/account";

import { DashboardLayout } from "../layouts/dashboard-layout";

import { rootRoute } from "./root.route";

// Pathless layout route: guards every authenticated page by confirming the
// httpOnly session cookie is valid (no client-held token to check anymore —
// this is a real server round-trip, not a decorative client check).
export const dashboardLayoutRoute = createRoute({
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
