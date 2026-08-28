import { UseCaseError } from "@/core/errors/use-case-error";

export class CardNotFoundError extends Error implements UseCaseError {
  public readonly code = "CARD_NOT_FOUND";

  public constructor() {
    super("Card not found.");
  }
}
