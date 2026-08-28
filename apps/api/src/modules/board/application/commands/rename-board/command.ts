import { Command } from "@/core/commands/command";

export class RenameBoardCommand implements Command {
  public constructor(
    public readonly props: {
      boardId: string;
      name: string;
    },
  ) {}
}
