import { DomainError } from "@/core/errors/domain-error";

export class PositionInvalidError extends DomainError {
  public readonly code = "POSITION_INVALID";
  public constructor() {
    super("position must be a finite number");
  }
}
