import { dashboardLayoutRoute } from "./dashboard-layout.route";
import { loginRoute } from "./login.route";
import { membersRoute } from "./members.route";
import { rootRoute } from "./root.route";
import { signupRoute } from "./signup.route";
import { workspaceHomeRoute } from "./workspace-home.route";
import { workspaceIndexRoute } from "./workspace-index.route";
import { workspaceLayoutRoute } from "./workspace-layout.route";

export const routeTree = rootRoute.addChildren([
  dashboardLayoutRoute.addChildren([
    workspaceIndexRoute,
    workspaceLayoutRoute.addChildren([workspaceHomeRoute, membersRoute]),
  ]),
  loginRoute,
  signupRoute,
]);

export type { RouterContext } from "./root.route";
