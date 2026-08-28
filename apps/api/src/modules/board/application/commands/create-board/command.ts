import { Command } from "@/core/commands/command";

export class CreateBoardCommand implements Command {
  public constructor(
    public readonly props: {
      workspaceId: string;
      name: string;
    },
  ) {}
}
