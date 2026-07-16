import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";

import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([homeRoute, loginRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
