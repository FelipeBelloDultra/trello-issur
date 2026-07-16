import { Command } from "@/core/commands/command";

export class CreateAccountCommand implements Command {
  public constructor(
    public readonly props: {
      name: string;
      email: string;
      password: string;
      createWorkspace?: boolean;
    },
  ) {}
}
