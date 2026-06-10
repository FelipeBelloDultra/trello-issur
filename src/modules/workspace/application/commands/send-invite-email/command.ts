import { Command } from "@/core/commands/command";

export class SendInviteEmailCommand implements Command {
  public constructor(public readonly inviteId: string) {}
}
