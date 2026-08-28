import { Command } from "@/core/commands/command";

export class AssignCardCommand implements Command {
  public constructor(
    public readonly props: {
      cardId: string;
      assigneeAccountId: string | null;
    },
  ) {}
}
