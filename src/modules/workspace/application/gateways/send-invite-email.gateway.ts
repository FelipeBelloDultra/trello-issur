import { WorkspaceMemberRole } from "@/modules/workspace/domain/value-objects/workspace-member-role";

export interface SendInviteEmailOptions {
  invitedEmail: string;
  invitedByName: string;
  workspaceName: string;
  role: WorkspaceMemberRole;
  token: string;
  expiresAt: Date;
}

export interface SendInviteEmailGateway {
  send(options: SendInviteEmailOptions): Promise<void>;
}
