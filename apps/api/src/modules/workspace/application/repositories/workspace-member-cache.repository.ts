import { WorkspaceMemberView } from "./workspace-member.repository";

export type WorkspaceMemberPage = {
  members: WorkspaceMemberView[];
  total: number;
};

export type FindMemberPageOptions = {
  workspaceId: string;
  page: number;
  limit: number;
};

export type StoreMemberPageOptions = FindMemberPageOptions & { data: WorkspaceMemberPage };

export interface WorkspaceMemberCacheRepository {
  findPage(options: FindMemberPageOptions): Promise<WorkspaceMemberPage | null>;
  storePage(options: StoreMemberPageOptions): Promise<void>;
  invalidate(workspaceId: string): Promise<void>;
}
