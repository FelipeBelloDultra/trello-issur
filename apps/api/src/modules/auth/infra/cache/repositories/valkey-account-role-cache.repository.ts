import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { AccountRoleCacheRepository } from "@/modules/auth/application/repositories/account-role-cache.repository";
import { RawPermissionKey } from "@/modules/auth/domain/value-objects/permission-key";
import { CacheRepository } from "@/shared/cache/application/repositories/cache.repository";

const TTL = 60 * 5;

@injectable()
export class ValkeyAccountRoleCacheRepository implements AccountRoleCacheRepository {
  public constructor(
    @inject(InjectionTokens.Cache.Repository)
    private readonly cache: CacheRepository,
  ) {}

  public async getMembership(accountId: string, workspaceId: string): Promise<boolean | null> {
    const raw = await this.cache.get(this.membershipKey(accountId, workspaceId));
    if (raw === null) return null;
    return true;
  }

  public async setMembership(accountId: string, workspaceId: string): Promise<void> {
    await this.cache.set(this.membershipKey(accountId, workspaceId), "1", TTL);
  }

  public async getPermissions(
    accountId: string,
    workspaceId: string,
  ): Promise<RawPermissionKey[] | null> {
    const raw = await this.cache.get(this.permissionsKey(accountId, workspaceId));
    if (!raw) return null;
    return JSON.parse(raw) as RawPermissionKey[];
  }

  public async setPermissions(
    accountId: string,
    workspaceId: string,
    permissions: RawPermissionKey[],
  ): Promise<void> {
    await this.cache.set(
      this.permissionsKey(accountId, workspaceId),
      JSON.stringify(permissions),
      TTL,
    );
  }

  public async getRole(accountId: string, workspaceId: string): Promise<string | null> {
    return this.cache.get(this.roleKey(accountId, workspaceId));
  }

  public async setRole(accountId: string, workspaceId: string, role: string): Promise<void> {
    await this.cache.set(this.roleKey(accountId, workspaceId), role, TTL);
  }

  public async invalidate(accountId: string, workspaceId: string): Promise<void> {
    await Promise.all([
      this.cache.delete(this.membershipKey(accountId, workspaceId)),
      this.cache.delete(this.permissionsKey(accountId, workspaceId)),
      this.cache.delete(this.roleKey(accountId, workspaceId)),
    ]);
  }

  private membershipKey(accountId: string, workspaceId: string): string {
    return this.cache.createKey(["membership", accountId, workspaceId]);
  }

  private permissionsKey(accountId: string, workspaceId: string): string {
    return this.cache.createKey(["permissions", accountId, workspaceId]);
  }

  private roleKey(accountId: string, workspaceId: string): string {
    return this.cache.createKey(["role", accountId, workspaceId]);
  }
}
