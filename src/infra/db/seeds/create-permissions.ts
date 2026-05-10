import { db } from "@/infra/db/client";
import { permissions } from "@/infra/db/schema";
import { PermissionKey } from "@/modules/auth/domain/value-objects/permission-key";

export async function createPermissions(): Promise<void> {
  await db
    .insert(permissions)
    .values([...PermissionKey.registry])
    .onConflictDoNothing({ target: permissions.key });
}
