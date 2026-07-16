import { Pagination } from "@/core/entity/pagination";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import {
  CreateWorkspaceMemberOptions,
  UpdateMemberRoleOptions,
  WorkspaceMemberRepository,
  WorkspaceMemberView,
} from "@/modules/workspace/application/repositories/workspace-member.repository";
import { WorkspaceMember } from "@/modules/workspace/domain/entities/workspace-member";

interface StoredMember {
  id: string;
  workspaceId: string;
  accountId: string;
  accountEmail?: string;
  role: string;
}

export class InMemoryWorkspaceMemberRepository implements WorkspaceMemberRepository {
  public readonly items: StoredMember[] = [];

  public create({ workspaceId, accountId, role }: CreateWorkspaceMemberOptions): Promise<boolean> {
    const exists = this.items.some(
      (m) => m.accountId === accountId && m.workspaceId === workspaceId,
    );
    if (exists) return Promise.resolve(false);
    this.items.push({ id: UniqueEntityID.create().toValue(), workspaceId, accountId, role });
    return Promise.resolve(true);
  }

  public existsByEmailAndWorkspace(email: string, workspaceId: string): Promise<boolean> {
    return Promise.resolve(
      this.items.some((m) => m.accountEmail === email && m.workspaceId === workspaceId),
    );
  }

  public findByAccountAndWorkspace(
    accountId: string,
    workspaceId: string,
  ): Promise<WorkspaceMember | null> {
    const item = this.items.find((m) => m.accountId === accountId && m.workspaceId === workspaceId);
    if (!item) return Promise.resolve(null);

    return Promise.resolve(
      WorkspaceMember.create(
        {
          workspaceId: UniqueEntityID.create(item.workspaceId),
          accountId: UniqueEntityID.create(item.accountId),
          role: item.role as WorkspaceMember["role"],
          createdAt: new Date(),
        },
        UniqueEntityID.create(item.id),
      ),
    );
  }

  public findById(id: string): Promise<WorkspaceMember | null> {
    const item = this.items.find((m) => m.id === id);
    if (!item) return Promise.resolve(null);

    return Promise.resolve(
      WorkspaceMember.create(
        {
          workspaceId: UniqueEntityID.create(item.workspaceId),
          accountId: UniqueEntityID.create(item.accountId),
          role: item.role as WorkspaceMember["role"],
          createdAt: new Date(),
        },
        UniqueEntityID.create(item.id),
      ),
    );
  }

  public findManyByWorkspace(
    workspaceId: string,
    pagination: Pagination,
  ): Promise<{ members: WorkspaceMemberView[]; total: number }> {
    const all = this.items.filter((m) => m.workspaceId === workspaceId);
    const members = all.slice(pagination.skip, pagination.skip + pagination.take).map((m) => ({
      id: m.id,
      accountId: m.accountId,
      accountName: "",
      accountEmail: "",
      role: m.role as WorkspaceMemberView["role"],
      joinedAt: new Date(),
    }));

    return Promise.resolve({ members, total: all.length });
  }

  public remove(id: string): Promise<void> {
    const index = this.items.findIndex((m) => m.id === id);
    if (index !== -1) this.items.splice(index, 1);
    return Promise.resolve();
  }

  public updateRole({ id, role }: UpdateMemberRoleOptions): Promise<void> {
    const item = this.items.find((m) => m.id === id);
    if (item) item.role = role;
    return Promise.resolve();
  }
}
