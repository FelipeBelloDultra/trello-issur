import { RawPermissionKey } from "@/modules/auth/domain/value-objects/permission-key";

export interface AccountRoleCacheRepository {
  getMembership(accountId: string, workspaceId: string): Promise<boolean | null>;
  setMembership(accountId: string, workspaceId: string): Promise<void>;
  getPermissions(accountId: string, workspaceId: string): Promise<RawPermissionKey[] | null>;
  setPermissions(
    accountId: string,
    workspaceId: string,
    permissions: RawPermissionKey[],
  ): Promise<void>;
  getRole(accountId: string, workspaceId: string): Promise<string | null>;
  setRole(accountId: string, workspaceId: string, role: string): Promise<void>;
  invalidate(accountId: string, workspaceId: string): Promise<void>;
}
