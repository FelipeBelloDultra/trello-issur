import { and, asc, eq, gt, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { inject, injectable } from "tsyringe";

import { Pagination } from "@/core/entity/pagination";
import { InjectionTokens } from "@/infra/container/tokens";
import { DatabaseClient } from "@/infra/db/client";
import { accounts } from "@/infra/db/schema/accounts";
import { workspaceInvites } from "@/infra/db/schema/workspace-invites";
import { workspaces } from "@/infra/db/schema/workspaces";
import { WorkspaceInviteCacheRepository } from "@/modules/workspace/application/repositories/workspace-invite-cache.repository";
import {
  WorkspaceInviteDetails,
  WorkspaceInviteRepository,
  WorkspaceInviteView,
} from "@/modules/workspace/application/repositories/workspace-invite.repository";
import { WorkspaceInvite } from "@/modules/workspace/domain/entities/workspace-invite";
import { WorkspaceInviteStatuses } from "@/modules/workspace/domain/value-objects/workspace-invite-status";

import { WorkspaceInviteMapper } from "../mappers/workspace-invite.mapper";

@injectable()
export class DrizzleWorkspaceInviteRepository implements WorkspaceInviteRepository {
  public constructor(
    @inject(InjectionTokens.Databases.Drizzle)
    private readonly db: DatabaseClient,
    @inject(InjectionTokens.Cache.WorkspaceInvite)
    private readonly inviteCache: WorkspaceInviteCacheRepository,
  ) {}

  public async create(invite: WorkspaceInvite): Promise<void> {
    await this.db.query
      .insert(workspaceInvites)
      .values(WorkspaceInviteMapper.toPersistence(invite));
    await this.inviteCache.invalidate(invite.workspaceId.toValue());
  }

  public async save(invite: WorkspaceInvite): Promise<void> {
    const { id, ...data } = WorkspaceInviteMapper.toPersistence(invite);
    await this.db.query.update(workspaceInvites).set(data).where(eq(workspaceInvites.id, id));
    await this.inviteCache.invalidate(invite.workspaceId.toValue());
  }

  public async findByToken(token: string): Promise<WorkspaceInvite | null> {
    const [row] = await this.db.query
      .select()
      .from(workspaceInvites)
      .where(eq(workspaceInvites.token, token))
      .limit(1);

    if (!row) return null;

    return WorkspaceInviteMapper.toDomain(row);
  }

  public async findPendingByEmailAndWorkspace(
    email: string,
    workspaceId: string,
  ): Promise<WorkspaceInvite | null> {
    const [row] = await this.db.query
      .select()
      .from(workspaceInvites)
      .where(
        and(
          eq(workspaceInvites.email, email),
          eq(workspaceInvites.workspaceId, workspaceId),
          eq(workspaceInvites.status, WorkspaceInviteStatuses.Pending),
          gt(workspaceInvites.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!row) return null;

    return WorkspaceInviteMapper.toDomain(row);
  }

  public async findDetailsById(id: string): Promise<WorkspaceInviteDetails | null> {
    const invitedByAccount = alias(accounts, "invited_by_account");
    const inviteeAccount = alias(accounts, "invitee_account");

    const [row] = await this.db.query
      .select({
        id: workspaceInvites.id,
        email: workspaceInvites.email,
        role: workspaceInvites.role,
        token: workspaceInvites.token,
        expiresAt: workspaceInvites.expiresAt,
        workspaceName: workspaces.name,
        invitedByName: invitedByAccount.name,
        inviteeAccountId: inviteeAccount.id,
      })
      .from(workspaceInvites)
      .innerJoin(workspaces, eq(workspaceInvites.workspaceId, workspaces.id))
      .innerJoin(invitedByAccount, eq(workspaceInvites.invitedByAccountId, invitedByAccount.id))
      .leftJoin(inviteeAccount, eq(inviteeAccount.email, workspaceInvites.email))
      .where(eq(workspaceInvites.id, id))
      .limit(1);

    if (!row) return null;

    return row as WorkspaceInviteDetails;
  }

  public async findManyByWorkspace(
    workspaceId: string,
    pagination: Pagination,
  ): Promise<{ invites: WorkspaceInviteView[]; total: number }> {
    const cached = await this.inviteCache.findPage({
      workspaceId,
      page: pagination.page,
      limit: pagination.limit,
    });

    if (cached) return cached;

    const [invites, countResult] = await Promise.all([
      this.db.query
        .select({
          id: workspaceInvites.id,
          email: workspaceInvites.email,
          role: workspaceInvites.role,
          status: workspaceInvites.status,
          invitedByName: accounts.name,
          expiresAt: workspaceInvites.expiresAt,
          createdAt: workspaceInvites.createdAt,
        })
        .from(workspaceInvites)
        .innerJoin(accounts, eq(workspaceInvites.invitedByAccountId, accounts.id))
        .where(eq(workspaceInvites.workspaceId, workspaceId))
        .orderBy(asc(workspaceInvites.createdAt))
        .limit(pagination.take)
        .offset(pagination.skip),
      this.db.query
        .select({ count: sql<number>`count(*)::int` })
        .from(workspaceInvites)
        .where(eq(workspaceInvites.workspaceId, workspaceId)),
    ]);

    const result = {
      invites: invites as WorkspaceInviteView[],
      total: countResult[0]?.count ?? 0,
    };

    await this.inviteCache.storePage({
      workspaceId,
      page: pagination.page,
      limit: pagination.limit,
      data: result,
    });

    return result;
  }
}
