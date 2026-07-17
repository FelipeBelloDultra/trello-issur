import { ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";

function initialsFor(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0]];
  return initials
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

interface UserMenuProps {
  name: string | undefined;
  email: string | undefined;
  onSignOut: () => void;
}

export function UserMenu({ name, email, onSignOut }: UserMenuProps) {
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="flex items-center justify-center">
                <Avatar className="size-6">
                  <AvatarFallback className="text-xs">{initialsFor(name)}</AvatarFallback>
                </Avatar>
                {/* Hidden (not just clipped) when collapsed to icon mode — see
                    the matching comment in workspace-switcher.tsx. */}
                <div className="flex flex-1 items-center gap-2 overflow-hidden group-data-[collapsible=icon]:hidden">
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{name ?? "..."}</span>
                    <span className="text-muted-foreground truncate text-xs">{email ?? ""}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuItem onSelect={onSignOut}>
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
