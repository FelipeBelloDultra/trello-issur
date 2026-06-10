import { Pagination } from "@/core/entity/pagination";
import { WorkspaceInvite } from "@/modules/workspace/domain/entities/workspace-invite";
import { WorkspaceInviteStatus } from "@/modules/workspace/domain/value-objects/workspace-invite-status";
import { WorkspaceMemberRole } from "@/modules/workspace/domain/value-objects/workspace-member-role";

export type WorkspaceInviteView = {
  id: string;
  email: string;
  role: WorkspaceMemberRole;
  status: WorkspaceInviteStatus;
  invitedByName: string;
  expiresAt: Date;
  createdAt: Date;
};

export type WorkspaceInviteDetails = {
  id: string;
  email: string;
  role: WorkspaceMemberRole;
  token: string;
  expiresAt: Date;
  workspaceName: string;
  invitedByName: string;
};

export interface WorkspaceInviteRepository {
  create(invite: WorkspaceInvite): Promise<void>;
  save(invite: WorkspaceInvite): Promise<void>;
  findByToken(token: string): Promise<WorkspaceInvite | null>;
  findPendingByEmailAndWorkspace(
    email: string,
    workspaceId: string,
  ): Promise<WorkspaceInvite | null>;
  findDetailsById(id: string): Promise<WorkspaceInviteDetails | null>;
  findManyByWorkspace(
    workspaceId: string,
    pagination: Pagination,
  ): Promise<{ invites: WorkspaceInviteView[]; total: number }>;
}
