import { Command } from "@/core/commands/command";

export class CreateColumnCommand implements Command {
  public constructor(
    public readonly props: {
      boardId: string;
      name: string;
    },
  ) {}
}
