import { Command } from "@/core/commands/command";

export class CreateCardCommand implements Command {
  public constructor(
    public readonly props: {
      columnId: string;
      title: string;
      description?: string | null;
    },
  ) {}
}
