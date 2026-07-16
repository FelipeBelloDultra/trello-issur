import { and, asc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { inject, injectable } from "tsyringe";

import { Pagination } from "@/core/entity/pagination";
import { InjectionTokens } from "@/infra/container/tokens";
import { DatabaseClient } from "@/infra/db/client";
import { accountRoles } from "@/infra/db/schema/account-roles";
import { accounts } from "@/infra/db/schema/accounts";
import { roles } from "@/infra/db/schema/roles";
import { WorkspaceMemberCacheRepository } from "@/modules/workspace/application/repositories/workspace-member-cache.repository";
import {
  CreateWorkspaceMemberOptions,
  UpdateMemberRoleOptions,
  WorkspaceMemberRepository,
  WorkspaceMemberView,
} from "@/modules/workspace/application/repositories/workspace-member.repository";
import { WorkspaceMember } from "@/modules/workspace/domain/entities/workspace-member";

import { WorkspaceMemberMapper } from "../mappers/workspace-member.mapper";

@injectable()
export class DrizzleWorkspaceMemberRepository implements WorkspaceMemberRepository {
  public constructor(
    @inject(InjectionTokens.Databases.Drizzle)
    private readonly db: DatabaseClient,
    @inject(InjectionTokens.Cache.WorkspaceMember)
    private readonly memberCache: WorkspaceMemberCacheRepository,
  ) {}

  public async create({
    workspaceId,
    accountId,
    role,
  }: CreateWorkspaceMemberOptions): Promise<boolean> {
    const [roleRow] = await this.db.query
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, role))
      .limit(1);

    if (!roleRow) {
      throw new Error(`role "${role}" not found`);
    }

    const inserted = await this.db.query
      .insert(accountRoles)
      .values({ accountId, roleId: roleRow.id, workspaceId })
      .onConflictDoNothing()
      .returning({ id: accountRoles.id });

    if (inserted.length === 0) return false;

    await this.memberCache.invalidate(workspaceId);
    return true;
  }

  public async existsByEmailAndWorkspace(email: string, workspaceId: string): Promise<boolean> {
    const inviteeAccount = alias(accounts, "invitee_account");

    const [row] = await this.db.query
      .select({ id: accountRoles.id })
      .from(accountRoles)
      .innerJoin(inviteeAccount, eq(accountRoles.accountId, inviteeAccount.id))
      .where(and(eq(inviteeAccount.email, email), eq(accountRoles.workspaceId, workspaceId)))
      .limit(1);

    return row !== undefined;
  }

  public async findById(id: string): Promise<WorkspaceMember | null> {
    const [row] = await this.db.query
      .select({
        id: accountRoles.id,
        accountId: accountRoles.accountId,
        workspaceId: accountRoles.workspaceId,
        roleName: roles.name,
        createdAt: accountRoles.createdAt,
      })
      .from(accountRoles)
      .innerJoin(roles, eq(accountRoles.roleId, roles.id))
      .where(eq(accountRoles.id, id))
      .limit(1);

    if (!row) return null;

    return WorkspaceMemberMapper.toDomain(row);
  }

  public async findByAccountAndWorkspace(
    accountId: string,
    workspaceId: string,
  ): Promise<WorkspaceMember | null> {
    const [row] = await this.db.query
      .select({
        id: accountRoles.id,
        accountId: accountRoles.accountId,
        workspaceId: accountRoles.workspaceId,
        roleName: roles.name,
        createdAt: accountRoles.createdAt,
      })
      .from(accountRoles)
      .innerJoin(roles, eq(accountRoles.roleId, roles.id))
      .where(and(eq(accountRoles.accountId, accountId), eq(accountRoles.workspaceId, workspaceId)))
      .limit(1);

    if (!row) return null;

    return WorkspaceMemberMapper.toDomain(row);
  }

  public async findManyByWorkspace(
    workspaceId: string,
    pagination: Pagination,
  ): Promise<{ members: WorkspaceMemberView[]; total: number }> {
    const cached = await this.memberCache.findPage({
      workspaceId,
      page: pagination.page,
      limit: pagination.limit,
    });

    if (cached) return cached;

    const [members, countResult] = await Promise.all([
      this.db.query
        .select({
          id: accountRoles.id,
          accountId: accountRoles.accountId,
          accountName: accounts.name,
          accountEmail: accounts.email,
          role: roles.name,
          joinedAt: accountRoles.createdAt,
        })
        .from(accountRoles)
        .innerJoin(roles, eq(accountRoles.roleId, roles.id))
        .innerJoin(accounts, eq(accountRoles.accountId, accounts.id))
        .where(eq(accountRoles.workspaceId, workspaceId))
        .orderBy(asc(accountRoles.createdAt))
        .limit(pagination.take)
        .offset(pagination.skip),
      this.db.query
        .select({ count: sql<number>`count(*)::int` })
        .from(accountRoles)
        .where(eq(accountRoles.workspaceId, workspaceId)),
    ]);

    const result = {
      members: members as WorkspaceMemberView[],
      total: countResult[0]?.count ?? 0,
    };

    await this.memberCache.storePage({
      workspaceId,
      page: pagination.page,
      limit: pagination.limit,
      data: result,
    });

    return result;
  }

  public async remove(id: string): Promise<void> {
    const [row] = await this.db.query
      .select({ workspaceId: accountRoles.workspaceId })
      .from(accountRoles)
      .where(eq(accountRoles.id, id))
      .limit(1);

    await this.db.query.delete(accountRoles).where(eq(accountRoles.id, id));

    if (row) {
      await this.memberCache.invalidate(row.workspaceId);
    }
  }

  public async updateRole({ id, role }: UpdateMemberRoleOptions): Promise<void> {
    const [roleRow] = await this.db.query
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, role))
      .limit(1);

    if (!roleRow) {
      throw new Error(`role "${role}" not found`);
    }

    const [row] = await this.db.query
      .select({ workspaceId: accountRoles.workspaceId })
      .from(accountRoles)
      .where(eq(accountRoles.id, id))
      .limit(1);

    await this.db.query
      .update(accountRoles)
      .set({ roleId: roleRow.id })
      .where(eq(accountRoles.id, id));

    if (row) {
      await this.memberCache.invalidate(row.workspaceId);
    }
  }
}
