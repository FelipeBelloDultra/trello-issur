import { Command } from "@/core/commands/command";
import { WorkspaceMemberRole } from "@/modules/workspace/domain/value-objects/workspace-member-role";

export type InviteMemberProps = {
  workspaceId: string;
  invitedByAccountId: string;
  email: string;
  role: WorkspaceMemberRole;
};

export class InviteMemberCommand implements Command {
  public constructor(public readonly props: InviteMemberProps) {}
}
