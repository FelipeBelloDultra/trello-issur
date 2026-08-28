import { DomainError } from "@/core/errors/domain-error";

export class BoardNameEmptyError extends DomainError {
  public readonly code = "BOARD_NAME_EMPTY";
  public constructor() {
    super("board name must not be empty");
  }
}
