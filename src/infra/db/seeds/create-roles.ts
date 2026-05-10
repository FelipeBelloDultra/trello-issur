import { inArray } from "drizzle-orm";

import { db } from "@/infra/db/client";
import { permissions, rolePermissions, roles } from "@/infra/db/schema";

import { PermissionKey } from "./create-permissions";

const ROLES = [
  { name: "admin", description: "Full control over the workspace" },
  { name: "member", description: "Can create and edit content" },
  { name: "viewer", description: "Read-only access" },
] as const;

const ROLE_PERMISSION_MAP: Record<string, PermissionKey[]> = {
  admin: [
    "workspace:manage",
    "workspace:delete",
    "workspace:invite",
    "workspace:remove-member",
    "board:create",
    "board:edit",
    "board:delete",
    "card:create",
    "card:edit",
    "card:delete",
    "card:move",
    "card:assign",
  ],
  member: [
    "workspace:invite",
    "board:create",
    "board:edit",
    "card:create",
    "card:edit",
    "card:move",
    "card:assign",
  ],
  viewer: [],
};

export async function createRoles(): Promise<void> {
  await db
    .insert(roles)
    .values([...ROLES])
    .onConflictDoNothing({ target: roles.name });

  const allKeys = Object.values(ROLE_PERMISSION_MAP).flat();
  const permRows = await db
    .select({ id: permissions.id, key: permissions.key })
    .from(permissions)
    .where(inArray(permissions.key, allKeys));

  const permByKey = Object.fromEntries(permRows.map((p) => [p.key, p.id]));
  const roleRows = await db.select({ id: roles.id, name: roles.name }).from(roles);
  const roleByName = Object.fromEntries(roleRows.map((r) => [r.name, r.id]));

  const assignments = Object.entries(ROLE_PERMISSION_MAP).flatMap(([roleName, keys]) =>
    keys.map((key) => ({ roleId: roleByName[roleName], permissionId: permByKey[key] })),
  );

  if (assignments.length > 0) {
    await db.insert(rolePermissions).values(assignments).onConflictDoNothing();
  }
}
