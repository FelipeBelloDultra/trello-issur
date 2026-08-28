import { Command } from "@/core/commands/command";

export class MoveCardCommand implements Command {
  public constructor(
    public readonly props: {
      cardId: string;
      columnId: string;
      position: number;
    },
  ) {}
}
