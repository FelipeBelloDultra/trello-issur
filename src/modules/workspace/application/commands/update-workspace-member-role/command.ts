import { Command } from "@/core/commands/command";

import { WorkspaceMemberRole } from "../../repositories/workspace-member.repository";

export class UpdateWorkspaceMemberRoleCommand implements Command {
  public constructor(
    public readonly workspaceId: string,
    public readonly memberId: string,
    public readonly role: WorkspaceMemberRole,
  ) {}
}
