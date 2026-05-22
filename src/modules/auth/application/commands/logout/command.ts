import { Command } from "@/core/commands/command";

export class LogoutCommand implements Command {
  public constructor(public readonly refreshToken: string) {}
}
