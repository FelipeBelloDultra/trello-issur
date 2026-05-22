import { Command } from "@/core/commands/command";

export class AuthenticateCommand implements Command {
  public constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}
