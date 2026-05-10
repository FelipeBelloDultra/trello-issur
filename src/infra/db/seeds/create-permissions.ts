import { db } from "@/infra/db/client";
import { permissions } from "@/infra/db/schema";

export const PERMISSIONS = [
  // Workspace
  { key: "workspace:manage", description: "Manage workspace settings" },
  { key: "workspace:delete", description: "Delete the workspace" },
  { key: "workspace:invite", description: "Invite members to the workspace" },
  { key: "workspace:remove-member", description: "Remove members from the workspace" },
  // Board
  { key: "board:create", description: "Create new boards" },
  { key: "board:edit", description: "Edit board settings" },
  { key: "board:delete", description: "Delete boards" },
  // Card
  { key: "card:create", description: "Create cards" },
  { key: "card:edit", description: "Edit cards" },
  { key: "card:delete", description: "Delete cards" },
  { key: "card:move", description: "Move cards between columns" },
  { key: "card:assign", description: "Assign cards to members" },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

export async function createPermissions(): Promise<void> {
  await db
    .insert(permissions)
    .values([...PERMISSIONS])
    .onConflictDoNothing({ target: permissions.key });
}
