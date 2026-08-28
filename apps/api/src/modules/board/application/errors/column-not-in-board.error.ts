import { UseCaseError } from "@/core/errors/use-case-error";

// FR-007: a card can only move between columns of its own board.
export class ColumnNotInBoardError extends Error implements UseCaseError {
  public readonly code = "COLUMN_NOT_IN_BOARD";

  public constructor() {
    super("Target column does not belong to the card's board.");
  }
}
