import { Command } from "@/core/commands/command";

export class MoveColumnCommand implements Command {
  public constructor(
    public readonly props: {
      columnId: string;
      name?: string;
      position?: number;
    },
  ) {}
}
