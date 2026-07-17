import { ChevronsUpDown } from "lucide-react";

import type { Workspace } from "@/entities/workspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";

interface WorkspaceSwitcherProps {
  workspaces: Workspace[] | undefined;
  currentWorkspace: Workspace | undefined;
  onSwitch: (workspaceId: string) => void;
}

export function WorkspaceSwitcher({
  workspaces,
  currentWorkspace,
  onSwitch,
}: WorkspaceSwitcherProps) {
  return (
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
                <DropdownMenuItem key={workspace.id} onSelect={() => onSwitch(workspace.id)}>
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
  );
}
