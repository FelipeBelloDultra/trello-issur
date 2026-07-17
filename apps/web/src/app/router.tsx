import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";

import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";

import { DashboardLayout } from "./layouts/dashboard-layout";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Pathless layout route: wraps every authenticated page in the sidebar shell.
// Add future dashboard pages (boards, members, settings, ...) as children of
// dashboardLayoutRoute so they inherit the sidebar and auth guard for free.
const dashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "dashboard-layout",
  component: DashboardLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/",
  component: HomePage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([
  dashboardLayoutRoute.addChildren([homeRoute]),
  loginRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
