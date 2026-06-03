import { Command } from "@/core/commands/command";

export class RefreshTokenCommand implements Command {
  public constructor(public readonly props: { refreshToken: string }) {}
}
