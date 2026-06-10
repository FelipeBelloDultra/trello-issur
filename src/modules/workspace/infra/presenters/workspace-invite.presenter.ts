import { WorkspaceInviteView } from "@/modules/workspace/application/repositories/workspace-invite.repository";

export class WorkspaceInvitePresenter {
  public static toHTTP(invite: WorkspaceInviteView) {
    return {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      invited_by_name: invite.invitedByName,
      expires_at: invite.expiresAt,
      created_at: invite.createdAt,
    };
  }
}
