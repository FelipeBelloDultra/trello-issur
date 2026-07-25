import { MyWorkspaceInviteView } from "@/modules/workspace/application/repositories/workspace-invite.repository";

export class MyWorkspaceInvitePresenter {
  public static toHTTP(invite: MyWorkspaceInviteView) {
    return {
      id: invite.id,
      token: invite.token,
      workspace_id: invite.workspaceId,
      workspace_name: invite.workspaceName,
      role: invite.role,
      invited_by_name: invite.invitedByName,
      expires_at: invite.expiresAt,
      created_at: invite.createdAt,
    };
  }
}
