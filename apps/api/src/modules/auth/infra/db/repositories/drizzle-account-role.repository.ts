import { and, eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { DatabaseClient } from "@/infra/db/client";
import { accountRoles, permissions, rolePermissions, roles } from "@/infra/db/schema";
import { AccountRoleCacheRepository } from "@/modules/auth/application/repositories/account-role-cache.repository";
import { AccountRoleRepository } from "@/modules/auth/application/repositories/account-role.repository";
import { RawPermissionKey } from "@/modules/auth/domain/value-objects/permission-key";

@injectable()
export class DrizzleAccountRoleRepository implements AccountRoleRepository {
  public constructor(
    @inject(InjectionTokens.Databases.Drizzle)
    private readonly db: DatabaseClient,
    @inject(InjectionTokens.Cache.AccountRole)
    private readonly accountRoleCache: AccountRoleCacheRepository,
  ) {}

  public async isMember(accountId: string, workspaceId: string): Promise<boolean> {
    const cached = await this.accountRoleCache.getMembership(accountId, workspaceId);
    if (cached !== null) return cached;

    const [row] = await this.db.query
      .select({ id: accountRoles.id })
      .from(accountRoles)
      .where(and(eq(accountRoles.accountId, accountId), eq(accountRoles.workspaceId, workspaceId)))
      .limit(1);

    const member = row !== undefined;
    if (member) await this.accountRoleCache.setMembership(accountId, workspaceId);

    return member;
  }

  public async findPermissions(
    accountId: string,
    workspaceId: string,
  ): Promise<RawPermissionKey[]> {
    const cached = await this.accountRoleCache.getPermissions(accountId, workspaceId);
    if (cached !== null) return cached;

    const rows = await this.db.query
      .select({ key: permissions.key })
      .from(accountRoles)
      .innerJoin(roles, eq(accountRoles.roleId, roles.id))
      .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
      .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
      .where(and(eq(accountRoles.accountId, accountId), eq(accountRoles.workspaceId, workspaceId)));

    const perms = rows.map((r) => r.key as RawPermissionKey);
    await this.accountRoleCache.setPermissions(accountId, workspaceId, perms);

    return perms;
  }

  public async findRole(accountId: string, workspaceId: string): Promise<string | null> {
    const cached = await this.accountRoleCache.getRole(accountId, workspaceId);
    if (cached !== null) return cached;

    const [row] = await this.db.query
      .select({ name: roles.name })
      .from(accountRoles)
      .innerJoin(roles, eq(accountRoles.roleId, roles.id))
      .where(and(eq(accountRoles.accountId, accountId), eq(accountRoles.workspaceId, workspaceId)))
      .limit(1);

    if (!row) return null;

    await this.accountRoleCache.setRole(accountId, workspaceId, row.name);

    return row.name;
  }
}
