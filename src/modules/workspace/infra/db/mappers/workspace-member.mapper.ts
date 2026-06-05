import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { WorkspaceMember } from "@/modules/workspace/domain/entities/workspace-member";
import { WorkspaceMemberRole } from "@/modules/workspace/domain/value-objects/workspace-member-role";

type WorkspaceMemberRow = {
  id: string;
  accountId: string;
  workspaceId: string;
  roleName: string;
  createdAt: Date;
};

export class WorkspaceMemberMapper {
  public static toDomain(raw: WorkspaceMemberRow): WorkspaceMember {
    return WorkspaceMember.create(
      {
        workspaceId: UniqueEntityID.create(raw.workspaceId),
        accountId: UniqueEntityID.create(raw.accountId),
        role: raw.roleName as WorkspaceMemberRole,
        createdAt: raw.createdAt,
      },
      UniqueEntityID.create(raw.id),
    );
  }
}
