import { Command } from "@/core/commands/command";

export class CreateWorkspaceCommand implements Command {
  public constructor(
    public readonly name: string,
    public readonly ownerId: string,
    public readonly isPersonal: boolean,
    public readonly description: string | null = null,
  ) {}
}
