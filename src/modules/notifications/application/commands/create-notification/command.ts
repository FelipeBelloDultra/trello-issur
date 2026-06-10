import { Command } from "@/core/commands/command";

import { CreateNotificationOptions } from "../../repositories/notification.repository";

export class CreateNotificationCommand implements Command {
  public constructor(public readonly props: CreateNotificationOptions) {}
}
