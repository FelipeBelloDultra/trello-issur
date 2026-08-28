import { Command } from "@/core/commands/command";

export class DeleteBoardCommand implements Command {
  public constructor(public readonly boardId: string) {}
}
