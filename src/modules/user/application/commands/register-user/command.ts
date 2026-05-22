import { Command } from "@/core/commands/command";

export class RegisterUserCommand implements Command {
  public constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
  ) {}
}
