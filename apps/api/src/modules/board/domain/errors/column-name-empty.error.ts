import { DomainError } from "@/core/errors/domain-error";

export class ColumnNameEmptyError extends DomainError {
  public readonly code = "COLUMN_NAME_EMPTY";
  public constructor() {
    super("column name must not be empty");
  }
}
