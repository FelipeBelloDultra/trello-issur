import { DomainError } from "@/core/errors/domain-error";

export class CardTitleEmptyError extends DomainError {
  public readonly code = "CARD_TITLE_EMPTY";
  public constructor() {
    super("card title must not be empty");
  }
}
