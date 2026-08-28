import { Command } from "@/core/commands/command";

export class UpdateCardCommand implements Command {
  public constructor(
    public readonly props: {
      cardId: string;
      title?: string;
      description?: string | null;
    },
  ) {}
}
