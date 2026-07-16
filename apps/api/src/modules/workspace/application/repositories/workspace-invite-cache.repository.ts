import { WorkspaceInviteView } from "./workspace-invite.repository";

export type WorkspaceInvitePage = { invites: WorkspaceInviteView[]; total: number };

export type FindInvitePageOptions = { workspaceId: string; page: number; limit: number };

export type StoreInvitePageOptions = FindInvitePageOptions & { data: WorkspaceInvitePage };

export interface WorkspaceInviteCacheRepository {
  findPage(options: FindInvitePageOptions): Promise<WorkspaceInvitePage | null>;
  storePage(options: StoreInvitePageOptions): Promise<void>;
  invalidate(workspaceId: string): Promise<void>;
}
