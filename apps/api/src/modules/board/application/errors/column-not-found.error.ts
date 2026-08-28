import { UseCaseError } from "@/core/errors/use-case-error";

export class ColumnNotFoundError extends Error implements UseCaseError {
  public readonly code = "COLUMN_NOT_FOUND";

  public constructor() {
    super("Column not found.");
  }
}
