import {
  WorkspaceMemberRepository,
  WorkspaceMemberRole,
} from "@/modules/workspace/application/repositories/workspace-member.repository";

interface WorkspaceMember {
  workspaceId: string;
  accountId: string;
  role: WorkspaceMemberRole;
}

export class InMemoryWorkspaceMemberRepository implements WorkspaceMemberRepository {
  public readonly items: WorkspaceMember[] = [];

  public async create(
    workspaceId: string,
    accountId: string,
    role: WorkspaceMemberRole,
  ): Promise<void> {
    await Promise.resolve(this.items.push({ workspaceId, accountId, role }));
  }
}
