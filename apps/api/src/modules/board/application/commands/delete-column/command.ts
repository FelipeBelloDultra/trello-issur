import { Command } from "@/core/commands/command";

export class DeleteColumnCommand implements Command {
  public constructor(public readonly columnId: string) {}
}
