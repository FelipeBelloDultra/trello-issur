import { Sidebar, SidebarRail } from "@/shared/ui/sidebar";

import { useAppSidebar } from "../model/use-app-sidebar";

import { UserMenu } from "./user-menu";
import { WorkspaceNav } from "./workspace-nav";
import { WorkspaceSwitcher } from "./workspace-switcher";

export function AppSidebar() {
  const {
    account,
    workspaces,
    currentWorkspace,
    workspaceId,
    membership,
    handleSignOut,
    handleSwitchWorkspace,
  } = useAppSidebar();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <WorkspaceSwitcher
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        onSwitch={handleSwitchWorkspace}
      />
      <WorkspaceNav
        workspaceId={workspaceId}
        role={membership?.role}
        permissions={membership?.permissions}
      />
      <UserMenu
        name={account?.name}
        email={account?.email}
        onSignOut={() => void handleSignOut()}
      />
      <SidebarRail />
    </Sidebar>
  );
}
