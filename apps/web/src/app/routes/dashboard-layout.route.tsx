import { createRoute, redirect } from "@tanstack/react-router";

import { useAuthStore } from "@/entities/session";

import { DashboardLayout } from "../layouts/dashboard-layout";

import { rootRoute } from "./root.route";

// Pathless layout route: guards every authenticated page by reading the Auth
// Store (rootRoute's beforeLoad already resolved it against the real httpOnly
// session cookie — this never fires its own /me or /refresh call).
export const dashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "dashboard-layout",
  beforeLoad: () => {
    if (useAuthStore.getState().status === "authenticated") return;

    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's documented throw-a-redirect pattern
    throw redirect({ to: "/login" });
  },
  component: DashboardLayout,
});
