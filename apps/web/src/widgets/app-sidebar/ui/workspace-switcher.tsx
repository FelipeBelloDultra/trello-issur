import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import type { Workspace } from "@/entities/workspace";
import { cn } from "@/shared/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
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

// Popover + Command instead of a plain DropdownMenu: cmdk's CommandList
// already caps at max-h-[300px] with its own scroll, and CommandInput gives
// free fuzzy-filtering — both needed once an account belongs to more than a
// handful of workspaces.
export function WorkspaceSwitcher({
  workspaces,
  currentWorkspace,
  onSwitch,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <SidebarMenuButton
                size="lg"
                aria-expanded={open}
                className="flex items-center justify-center"
              >
                <div className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold">
                  {currentWorkspace ? currentWorkspace.name.slice(0, 2).toUpperCase() : "TI"}
                </div>
                {/* Hidden (not just clipped) when collapsed to icon mode — an
                    un-hidden sibling here would otherwise fight the fixed-size
                    avatar for space inside the 32px collapsed button. */}
                <div className="flex flex-1 items-center gap-2 overflow-hidden group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium">
                    {currentWorkspace?.name ?? "Select workspace"}
                  </span>
                  <ChevronsUpDown className="text-muted-foreground ml-auto size-4" />
                </div>
              </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" className="w-64 p-0">
              <Command>
                <CommandInput placeholder="Find workspace..." />
                <CommandList>
                  <CommandEmpty>No workspace found.</CommandEmpty>
                  <CommandGroup>
                    {workspaces?.map((workspace) => {
                      const isCurrent = currentWorkspace?.id === workspace.id;
                      return (
                        <CommandItem
                          key={workspace.id}
                          value={workspace.name}
                          disabled={isCurrent}
                          onSelect={() => {
                            if (isCurrent) return;
                            onSwitch(workspace.id);
                            setOpen(false);
                          }}
                        >
                          <Check className={cn(isCurrent ? "opacity-100" : "opacity-0")} />
                          <span className="truncate">{workspace.name}</span>
                          <span className="text-muted-foreground ml-auto text-xs capitalize">
                            {workspace.role}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
