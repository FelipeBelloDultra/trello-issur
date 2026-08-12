import { AccountRoleCacheRepository } from "@/modules/auth/application/repositories/account-role-cache.repository";
import { RawPermissionKey } from "@/modules/auth/domain/value-objects/permission-key";

export class InMemoryAccountRoleCacheRepository implements AccountRoleCacheRepository {
  public membership: Map<string, boolean> = new Map();
  public permissions: Map<string, RawPermissionKey[]> = new Map();
  public roles: Map<string, string> = new Map();
  public invalidateCalls: Array<{ accountId: string; workspaceId: string }> = [];

  public async getMembership(accountId: string, workspaceId: string): Promise<boolean | null> {
    return Promise.resolve(this.membership.get(this.key(accountId, workspaceId)) ?? null);
  }

  public async setMembership(accountId: string, workspaceId: string): Promise<void> {
    this.membership.set(this.key(accountId, workspaceId), true);
    await Promise.resolve();
  }

  public async getPermissions(
    accountId: string,
    workspaceId: string,
  ): Promise<RawPermissionKey[] | null> {
    return Promise.resolve(this.permissions.get(this.key(accountId, workspaceId)) ?? null);
  }

  public async setPermissions(
    accountId: string,
    workspaceId: string,
    permissions: RawPermissionKey[],
  ): Promise<void> {
    this.permissions.set(this.key(accountId, workspaceId), permissions);
    await Promise.resolve();
  }

  public async getRole(accountId: string, workspaceId: string): Promise<string | null> {
    return Promise.resolve(this.roles.get(this.key(accountId, workspaceId)) ?? null);
  }

  public async setRole(accountId: string, workspaceId: string, role: string): Promise<void> {
    this.roles.set(this.key(accountId, workspaceId), role);
    await Promise.resolve();
  }

  public async invalidate(accountId: string, workspaceId: string): Promise<void> {
    this.invalidateCalls.push({ accountId, workspaceId });
    this.membership.delete(this.key(accountId, workspaceId));
    this.permissions.delete(this.key(accountId, workspaceId));
    this.roles.delete(this.key(accountId, workspaceId));
    await Promise.resolve();
  }

  private key(accountId: string, workspaceId: string): string {
    return `${accountId}:${workspaceId}`;
  }
}
