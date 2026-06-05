import { Command } from "@/core/commands/command";

export class RemoveWorkspaceMemberCommand implements Command {
  public constructor(public readonly memberId: string) {}
}
