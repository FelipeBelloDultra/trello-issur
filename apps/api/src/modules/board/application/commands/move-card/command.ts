import { Command } from "@/core/commands/command";

export class MoveCardCommand implements Command {
  public constructor(
    public readonly props: {
      cardId: string;
      columnId: string;
      // Zero-based position within the destination column's card list,
      // excluding the card being moved — the handler resolves the actual
      // fractional Position from this (see research.md §6).
      index: number;
    },
  ) {}
}
