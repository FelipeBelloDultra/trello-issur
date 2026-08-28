import { Command } from "@/core/commands/command";

export class DeleteCardCommand implements Command {
  public constructor(public readonly cardId: string) {}
}
