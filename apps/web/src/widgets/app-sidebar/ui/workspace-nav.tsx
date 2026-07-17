import { Link, useLocation } from "@tanstack/react-router";
import { Kanban, LayoutDashboard, Settings, Users } from "lucide-react";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";

// Placeholders for the modules left to build (see apps/web/README.md) — kept
// visible so the sidebar structure reads like a real product, disabled since
// there's nothing to link to yet regardless of permissions.
const upcomingNavItems = [
  { title: "Boards", icon: Kanban },
  { title: "Settings", icon: Settings },
];

interface WorkspaceNavProps {
  workspaceId: string | undefined;
  role: string | undefined;
}

export function WorkspaceNav({ workspaceId, role }: WorkspaceNavProps) {
  const location = useLocation();

  const workspaceNavItems = workspaceId
    ? [
        { title: "Home", to: `/w/${workspaceId}`, icon: LayoutDashboard },
        { title: "Members", to: `/w/${workspaceId}/members`, icon: Users },
      ]
    : [];

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {workspaceNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={location.pathname === item.to}
                >
                  <Link to={item.to}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Coming soon</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {upcomingNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} disabled>
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {role ? (
        <div className="text-muted-foreground mt-auto px-2 pb-2 text-xs capitalize">
          Your role: {role}
        </div>
      ) : null}
    </SidebarContent>
  );
}
