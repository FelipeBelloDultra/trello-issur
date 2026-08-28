import { UseCaseError } from "@/core/errors/use-case-error";

export class BoardNotFoundError extends Error implements UseCaseError {
  public readonly code = "BOARD_NOT_FOUND";

  public constructor() {
    super("Board not found.");
  }
}
