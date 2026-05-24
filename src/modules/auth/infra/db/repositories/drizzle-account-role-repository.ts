import { and, eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

import { CacheRepository } from "@/infra/cache/cache.repository";
import { InjectionTokens } from "@/infra/container/tokens";
import { DatabaseClient } from "@/infra/db/client";
import { accountRoles, permissions, rolePermissions, roles } from "@/infra/db/schema";
import { AccountRoleRepository } from "@/modules/auth/application/repositories/account-role-repository";
import { RawPermissionKey } from "@/modules/auth/domain/value-objects/permission-key";

const CACHE_TTL = 60 * 5;

@injectable()
export class DrizzleAccountRoleRepository implements AccountRoleRepository {
  public constructor(
    @inject(InjectionTokens.Databases.Drizzle)
    private readonly db: DatabaseClient,
    @inject(InjectionTokens.Cache.Repository)
    private readonly cache: CacheRepository,
  ) {}

  public async isMember(accountId: string, workspaceId: string): Promise<boolean> {
    const cacheKey = this.cache.createKey(["membership", accountId, workspaceId]);
    const cached = await this.cache.get(cacheKey);

    if (cached) return true;

    const [row] = await this.db.query
      .select({ id: accountRoles.id })
      .from(accountRoles)
      .where(and(eq(accountRoles.accountId, accountId), eq(accountRoles.workspaceId, workspaceId)))
      .limit(1);

    const member = row !== undefined;
    if (member) await this.cache.set(cacheKey, "1", CACHE_TTL);

    return member;
  }

  public async findPermissions(
    accountId: string,
    workspaceId: string,
  ): Promise<RawPermissionKey[]> {
    const cacheKey = this.cache.createKey(["permissions", accountId, workspaceId]);
    const cached = await this.cache.get(cacheKey);

    if (cached) return JSON.parse(cached) as RawPermissionKey[];

    const rows = await this.db.query
      .select({ key: permissions.key })
      .from(accountRoles)
      .innerJoin(roles, eq(accountRoles.roleId, roles.id))
      .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
      .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
      .where(and(eq(accountRoles.accountId, accountId), eq(accountRoles.workspaceId, workspaceId)));

    const perms = rows.map((r) => r.key as RawPermissionKey);
    await this.cache.set(cacheKey, JSON.stringify(perms), CACHE_TTL);

    return perms;
  }
}
