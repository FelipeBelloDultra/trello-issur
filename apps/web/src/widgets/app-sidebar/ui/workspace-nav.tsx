import { Link, useLocation } from "@tanstack/react-router";
import {
  ChevronRight,
  CreditCard,
  Kanban,
  LayoutDashboard,
  Settings,
  SlidersHorizontal,
  UserCog,
  Users,
} from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/collapsible";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/shared/ui/sidebar";

import type { LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  icon: LucideIcon;
  to?: string;
  /** Required permission to show this item at all — omit for "any member". */
  permission?: string;
  items?: NavItem[];
}

interface WorkspaceNavProps {
  workspaceId: string | undefined;
  role: string | undefined;
  permissions: string[] | undefined;
}

export function WorkspaceNav({ workspaceId, role, permissions }: WorkspaceNavProps) {
  const location = useLocation();

  const workspaceNavItems: NavItem[] = workspaceId
    ? [
        { title: "Home", to: `/w/${workspaceId}`, icon: LayoutDashboard },
        { title: "Members", to: `/w/${workspaceId}/members`, icon: Users },
      ]
    : [];

  // Placeholders for the modules left to build (see apps/web/README.md) — kept
  // visible so the sidebar structure reads like a real product. "Settings" is
  // additionally gated behind workspace:manage (owner/admin only) to show the
  // permission-filtering pattern, and nested to show the collapsible
  // sub-item pattern — both dormant until the settings module actually ships,
  // at which point the sub-items just need a real `to`.
  const upcomingNavItems: NavItem[] = [
    { title: "Boards", icon: Kanban },
    {
      title: "Settings",
      icon: Settings,
      permission: "workspace:manage",
      items: [
        { title: "General", icon: SlidersHorizontal },
        { title: "Members", icon: UserCog },
        { title: "Billing", icon: CreditCard },
      ],
    },
  ].filter((item) => !item.permission || (permissions?.includes(item.permission) ?? false));

  const isActive = (to: string | undefined): boolean => !!to && location.pathname === to;
  const hasActiveChild = (item: NavItem): boolean =>
    item.items?.some((child) => isActive(child.to)) ?? false;

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {workspaceNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.to)}>
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
            {upcomingNavItems.map((item) =>
              item.items ? (
                <Collapsible
                  key={item.title}
                  defaultOpen={hasActiveChild(item)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        <item.icon />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton isActive={isActive(subItem.to)} aria-disabled>
                              <subItem.icon />
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} disabled>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ),
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {role ? (
        <div className="text-muted-foreground group-data-[collapsible=icon]:hidden mt-auto px-2 pb-2 text-xs capitalize">
          Your role: {role}
        </div>
      ) : null}
    </SidebarContent>
  );
}
