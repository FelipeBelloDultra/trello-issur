import { inArray } from "drizzle-orm";

import { db } from "@/infra/db/client";
import { permissions, rolePermissions, roles } from "@/infra/db/schema";
import { UserRole } from "@/modules/auth/domain/value-objects/user-role";

export async function createRoles(): Promise<void> {
  await db
    .insert(roles)
    .values([...UserRole.registry])
    .onConflictDoNothing({ target: roles.name });

  const allKeys = Object.values(UserRole.permissionMap).flat();
  const permRows = await db
    .select({ id: permissions.id, key: permissions.key })
    .from(permissions)
    .where(inArray(permissions.key, allKeys));

  const permByKey = Object.fromEntries(permRows.map((p) => [p.key, p.id]));
  const roleRows = await db.select({ id: roles.id, name: roles.name }).from(roles);
  const roleByName = Object.fromEntries(roleRows.map((r) => [r.name, r.id]));

  const assignments = Object.entries(UserRole.permissionMap).flatMap(([roleName, keys]) =>
    keys.map((key) => ({ roleId: roleByName[roleName], permissionId: permByKey[key] })),
  );

  if (assignments.length > 0) {
    await db.insert(rolePermissions).values(assignments).onConflictDoNothing();
  }
}
