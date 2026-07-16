import { WorkspaceRepository } from "@/modules/workspace/application/repositories/workspace.repository";
import { Workspace } from "@/modules/workspace/domain/entities/workspace";

export class InMemoryWorkspaceRepository implements WorkspaceRepository {
  public readonly items: Workspace[] = [];

  public async create(workspace: Workspace): Promise<void> {
    await Promise.resolve(this.items.push(workspace));
  }

  public async findById(id: string): Promise<Workspace | null> {
    const workspace = this.items.find((w) => w.id.toValue() === id);
    return Promise.resolve(workspace ?? null);
  }

  public async save(workspace: Workspace): Promise<void> {
    const index = this.items.findIndex((w) => w.id.equals(workspace.id));
    if (index >= 0) this.items[index] = workspace;
    return Promise.resolve();
  }

  public async findBySlug(slug: string): Promise<Workspace | null> {
    const workspace = this.items.find((w) => w.slug.toString() === slug);
    return Promise.resolve(workspace ?? null);
  }
}
