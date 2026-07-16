import { Command } from "@/core/commands/command";

export class AuthenticateCommand implements Command {
  public constructor(
    public readonly props: {
      email: string;
      password: string;
    },
  ) {}
}
