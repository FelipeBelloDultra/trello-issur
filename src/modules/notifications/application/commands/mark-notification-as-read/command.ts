import { Command } from "@/core/commands/command";

export class MarkNotificationAsReadCommand implements Command {
  public constructor(
    public readonly notificationId: string,
    public readonly accountId: string,
  ) {}
}
