import { eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { DatabaseClient } from "@/infra/db/client";
import { accountRoles } from "@/infra/db/schema/account-roles";
import { workspaces } from "@/infra/db/schema/workspaces";
import { WorkspaceRepository } from "@/modules/workspace/application/repositories/workspace.repository";
import { Workspace } from "@/modules/workspace/domain/entities/workspace";

import { WorkspaceMapper } from "../mappers/workspace.mapper";

@injectable()
export class DrizzleWorkspaceRepository implements WorkspaceRepository {
  public constructor(
    @inject(InjectionTokens.Databases.Drizzle)
    private readonly db: DatabaseClient,
  ) {}

  public async create(workspace: Workspace): Promise<void> {
    await this.db.query.insert(workspaces).values(WorkspaceMapper.toPersistence(workspace));
  }

  public async save(workspace: Workspace): Promise<void> {
    const { description, avatarUrl, name, updatedAt } = WorkspaceMapper.toPersistence(workspace);

    await this.db.query
      .update(workspaces)
      .set({ name, description, avatarUrl, updatedAt })
      .where(eq(workspaces.id, workspace.id.toValue()));
  }

  public async findById(id: string): Promise<Workspace | null> {
    const [row] = await this.db.query
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id))
      .limit(1);

    return row ? WorkspaceMapper.toDomain(row) : null;
  }

  public async findBySlug(slug: string): Promise<Workspace | null> {
    const [row] = await this.db.query
      .select()
      .from(workspaces)
      .where(eq(workspaces.slug, slug))
      .limit(1);

    return row ? WorkspaceMapper.toDomain(row) : null;
  }

  public async findAllByAccountId(accountId: string): Promise<Workspace[]> {
    const rows = await this.db.query
      .select({ workspace: workspaces })
      .from(workspaces)
      .innerJoin(accountRoles, eq(accountRoles.workspaceId, workspaces.id))
      .where(eq(accountRoles.accountId, accountId));

    return rows.map((r) => WorkspaceMapper.toDomain(r.workspace));
  }
}
