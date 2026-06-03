export type WorkspaceMemberRole = "owner" | "admin" | "member" | "viewer";

export interface WorkspaceMemberRepository {
  create(workspaceId: string, accountId: string, role: WorkspaceMemberRole): Promise<void>;
}
