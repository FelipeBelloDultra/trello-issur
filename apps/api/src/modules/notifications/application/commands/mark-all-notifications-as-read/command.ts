import { Command } from "@/core/commands/command";

export class MarkAllNotificationsAsReadCommand implements Command {
  public constructor(public readonly accountId: string) {}
}
