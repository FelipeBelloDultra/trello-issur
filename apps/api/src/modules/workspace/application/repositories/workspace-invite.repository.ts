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
  inviteeAccountId: string | null;
};

// Includes the raw token — only ever returned to a request authenticated as
// the invite's own email (see ListMyInvitesHandler), never persisted in a
// queue payload or notification, so it can't leak through those channels.
export type MyWorkspaceInviteView = {
  id: string;
  token: string;
  workspaceId: string;
  workspaceName: string;
  role: WorkspaceMemberRole;
  invitedByName: string;
  expiresAt: Date;
  createdAt: Date;
};

export type WorkspaceInviteAcceptanceDetails = {
  invitedByAccountId: string;
  workspaceName: string;
  accepterName: string;
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
  findPendingByEmail(
    email: string,
    pagination: Pagination,
  ): Promise<{ invites: MyWorkspaceInviteView[]; total: number }>;
  findAcceptanceDetails(
    inviteId: string,
    accepterAccountId: string,
  ): Promise<WorkspaceInviteAcceptanceDetails | null>;
}
