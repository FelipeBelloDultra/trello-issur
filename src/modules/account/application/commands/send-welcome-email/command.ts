import { Command } from "@/core/commands/command";

export class SendWelcomeEmailCommand implements Command {
  public constructor(
    public readonly name: string,
    public readonly email: string,
  ) {}
}
