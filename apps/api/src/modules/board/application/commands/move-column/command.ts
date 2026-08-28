import { Command } from "@/core/commands/command";

export class MoveColumnCommand implements Command {
  public constructor(
    public readonly props: {
      columnId: string;
      name?: string;
      // Zero-based position within the board's column list, excluding the
      // column being moved — the handler resolves the actual fractional
      // Position from this (see research.md §6).
      index?: number;
    },
  ) {}
}
