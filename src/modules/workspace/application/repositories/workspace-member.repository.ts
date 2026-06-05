import { Pagination } from "@/core/entity/pagination";

import { WorkspaceMember } from "../../domain/entities/workspace-member";
import { WorkspaceMemberRole } from "../../domain/value-objects/workspace-member-role";

export { WorkspaceMemberRole };

export type WorkspaceMemberView = {
  id: string;
  accountId: string;
  accountName: string;
  accountEmail: string;
  role: WorkspaceMemberRole;
  joinedAt: Date;
};

export type CreateWorkspaceMemberOptions = {
  workspaceId: string;
  accountId: string;
  role: WorkspaceMemberRole;
};

export type UpdateMemberRoleOptions = {
  id: string;
  role: WorkspaceMemberRole;
};

export interface WorkspaceMemberRepository {
  create(options: CreateWorkspaceMemberOptions): Promise<void>;
  findById(id: string): Promise<WorkspaceMember | null>;
  findManyByWorkspace(
    workspaceId: string,
    pagination: Pagination,
  ): Promise<{ members: WorkspaceMemberView[]; total: number }>;
  remove(id: string): Promise<void>;
  updateRole(options: UpdateMemberRoleOptions): Promise<void>;
}
