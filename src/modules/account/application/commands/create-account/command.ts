import { Command } from "@/core/commands/command";

export class CreateAccountCommand implements Command {
  public constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly createWorkspace: boolean = false,
  ) {}
}
