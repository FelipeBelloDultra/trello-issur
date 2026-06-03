import { Command } from "@/core/commands/command";

export class CreateWorkspaceCommand implements Command {
  public constructor(
    public readonly props: {
      name: string;
      ownerId: string;
      isPersonal: boolean;
      description?: string | null;
    },
  ) {}
}
