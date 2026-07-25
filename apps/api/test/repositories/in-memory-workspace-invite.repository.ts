import { Pagination } from "@/core/entity/pagination";
import {
  MyWorkspaceInviteView,
  WorkspaceInviteDetails,
  WorkspaceInviteRepository,
  WorkspaceInviteView,
} from "@/modules/workspace/application/repositories/workspace-invite.repository";
import { WorkspaceInvite } from "@/modules/workspace/domain/entities/workspace-invite";

export class InMemoryWorkspaceInviteRepository implements WorkspaceInviteRepository {
  public readonly items: WorkspaceInvite[] = [];

  public create(invite: WorkspaceInvite): Promise<void> {
    this.items.push(invite);
    return Promise.resolve();
  }

  public save(invite: WorkspaceInvite): Promise<void> {
    const index = this.items.findIndex((i) => i.id.equals(invite.id));
    if (index !== -1) this.items[index] = invite;
    return Promise.resolve();
  }

  public findByToken(token: string): Promise<WorkspaceInvite | null> {
    return Promise.resolve(this.items.find((i) => i.token === token) ?? null);
  }

  public findPendingByEmailAndWorkspace(
    email: string,
    workspaceId: string,
  ): Promise<WorkspaceInvite | null> {
    return Promise.resolve(
      this.items.find(
        (i) => i.email === email && i.workspaceId.toValue() === workspaceId && i.isPending(),
      ) ?? null,
    );
  }

  public findDetailsById(id: string): Promise<WorkspaceInviteDetails | null> {
    const invite = this.items.find((i) => i.id.toValue() === id);
    if (!invite) return Promise.resolve(null);

    return Promise.resolve({
      id: invite.id.toValue(),
      email: invite.email,
      role: invite.role,
      token: invite.token,
      expiresAt: invite.expiresAt.value,
      workspaceName: "",
      invitedByName: "",
      inviteeAccountId: null,
    });
  }

  public findManyByWorkspace(
    workspaceId: string,
    pagination: Pagination,
  ): Promise<{ invites: WorkspaceInviteView[]; total: number }> {
    const all = this.items.filter((i) => i.workspaceId.toValue() === workspaceId);
    const invites = all.slice(pagination.skip, pagination.skip + pagination.take).map((i) => ({
      id: i.id.toValue(),
      email: i.email,
      role: i.role,
      status: i.status,
      invitedByName: "",
      expiresAt: i.expiresAt.value,
      createdAt: i.createdAt,
    }));

    return Promise.resolve({ invites, total: all.length });
  }

  public findPendingByEmail(
    email: string,
    pagination: Pagination,
  ): Promise<{ invites: MyWorkspaceInviteView[]; total: number }> {
    const all = this.items.filter((i) => i.email === email && i.isPending() && !i.isExpired());
    const invites = all.slice(pagination.skip, pagination.skip + pagination.take).map((i) => ({
      id: i.id.toValue(),
      token: i.token,
      workspaceId: i.workspaceId.toValue(),
      workspaceName: "",
      role: i.role,
      invitedByName: "",
      expiresAt: i.expiresAt.value,
      createdAt: i.createdAt,
    }));

    return Promise.resolve({ invites, total: all.length });
  }
}
