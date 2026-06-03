import { WorkspaceRepository } from "@/modules/workspace/application/repositories/workspace.repository";
import { Workspace } from "@/modules/workspace/domain/entities/workspace";

export class InMemoryWorkspaceRepository implements WorkspaceRepository {
  public readonly items: Workspace[] = [];

  public async create(workspace: Workspace): Promise<void> {
    this.items.push(workspace);
  }

  public async findById(id: string): Promise<Workspace | null> {
    return this.items.find((w) => w.id.toValue() === id) ?? null;
  }

  public async findBySlug(slug: string): Promise<Workspace | null> {
    return this.items.find((w) => w.slug.toString() === slug) ?? null;
  }
}
