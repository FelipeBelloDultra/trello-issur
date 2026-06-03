import { eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { DatabaseClient } from "@/infra/db/client";
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
}
