import { RawPermissionKey } from "@/modules/auth/domain/value-objects/permission-key";

export interface AccountRoleRepository {
  isMember(accountId: string, workspaceId: string): Promise<boolean>;
  findPermissions(accountId: string, workspaceId: string): Promise<RawPermissionKey[]>;
}
