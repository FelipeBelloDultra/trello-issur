import { DatabaseClient } from "@/infra/db/client";
import { permissions } from "@/infra/db/schema";
import { PermissionKey } from "@/modules/auth/domain/value-objects/permission-key";

export async function createPermissions(client: DatabaseClient): Promise<void> {
  await client.query
    .insert(permissions)
    .values([...PermissionKey.registry])
    .onConflictDoNothing({ target: permissions.key });
}
