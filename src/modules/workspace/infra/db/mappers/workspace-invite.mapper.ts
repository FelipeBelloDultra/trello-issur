import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { WorkspaceInvite } from "@/modules/workspace/domain/entities/workspace-invite";
import { InviteExpiry } from "@/modules/workspace/domain/value-objects/invite-expiry";
import { WorkspaceInviteStatus } from "@/modules/workspace/domain/value-objects/workspace-invite-status";
import { WorkspaceMemberRole } from "@/modules/workspace/domain/value-objects/workspace-member-role";

type WorkspaceInviteRow = {
  id: string;
  workspaceId: string;
  invitedByAccountId: string;
  email: string;
  role: string;
  token: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class WorkspaceInviteMapper {
  public static toDomain(raw: WorkspaceInviteRow): WorkspaceInvite {
    return WorkspaceInvite.create(
      {
        workspaceId: UniqueEntityID.create(raw.workspaceId),
        invitedByAccountId: UniqueEntityID.create(raw.invitedByAccountId),
        email: raw.email,
        role: raw.role as WorkspaceMemberRole,
        token: raw.token,
        status: raw.status as WorkspaceInviteStatus,
        expiresAt: InviteExpiry.restore(raw.expiresAt),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      UniqueEntityID.create(raw.id),
    );
  }

  public static toPersistence(invite: WorkspaceInvite) {
    return {
      id: invite.id.toValue(),
      workspaceId: invite.workspaceId.toValue(),
      invitedByAccountId: invite.invitedByAccountId.toValue(),
      email: invite.email,
      role: invite.role,
      token: invite.token,
      status: invite.status,
      expiresAt: invite.expiresAt.value,
      createdAt: invite.createdAt,
      updatedAt: invite.updatedAt,
    };
  }
}
