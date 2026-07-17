import { Link, useLocation, useNavigate, useParams, useRouteContext } from "@tanstack/react-router";
import { ChevronsUpDown, Kanban, LayoutDashboard, LogOut, Settings, Users } from "lucide-react";

import { useAccountQuery } from "@/entities/account";
import { useWorkspacesQuery } from "@/entities/workspace";
import { useLogout } from "@/features/authenticate";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/shared/ui/sidebar";

// Placeholders for the modules left to build (see apps/web/README.md) — kept
// visible so the sidebar structure reads like a real product, disabled since
// there's nothing to link to yet regardless of permissions.
const upcomingNavItems = [
  { title: "Boards", icon: Kanban },
  { title: "Settings", icon: Settings },
];

function initialsFor(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0]];
  return initials
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId } = useParams({ strict: false });
  // UX-only: which nav items render as enabled. The actual enforcement is
  // AuthorizeMiddleware/ValidateWorkspaceMiddleware on the server — this never
  // substitutes for that, it only avoids showing dead links.
  const membership = useRouteContext({ strict: false });
  const { data: account } = useAccountQuery();
  const { data: workspaces } = useWorkspacesQuery();
  const logout = useLogout();

  const currentWorkspace = workspaces?.find((w) => w.id === workspaceId);

  const handleSignOut = async () => {
    await logout.mutateAsync();
    void navigate({ to: "/login" });
  };

  const handleSwitchWorkspace = (targetWorkspaceId: string) => {
    void navigate({ to: "/w/$workspaceId", params: { workspaceId: targetWorkspaceId } });
  };

  const workspaceNavItems = workspaceId
    ? [
        { title: "Home", to: `/w/${workspaceId}`, icon: LayoutDashboard },
        { title: "Members", to: `/w/${workspaceId}/members`, icon: Users },
      ]
    : [];

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md text-xs font-semibold">
                    {currentWorkspace ? currentWorkspace.name.slice(0, 2).toUpperCase() : "TI"}
                  </div>
                  <span className="truncate font-medium">
                    {currentWorkspace?.name ?? "Select workspace"}
                  </span>
                  <ChevronsUpDown className="text-muted-foreground ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="start" className="w-56">
                {workspaces?.map((workspace) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onSelect={() => handleSwitchWorkspace(workspace.id)}
                  >
                    <span className="truncate">{workspace.name}</span>
                    <span className="text-muted-foreground ml-auto text-xs capitalize">
                      {workspace.role}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

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

        {membership?.role ? (
          <div className="text-muted-foreground mt-auto px-2 pb-2 text-xs capitalize">
            Your role: {membership.role}
          </div>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-xs">
                      {initialsFor(account?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{account?.name ?? "..."}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {account?.email ?? ""}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem onSelect={() => void handleSignOut()}>
                  <LogOut />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
