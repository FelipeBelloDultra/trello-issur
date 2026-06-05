import { DomainError } from "@/core/errors/domain-error";

export class InvalidAccountNameError extends Error implements DomainError {
  public readonly code = "INVALID_ACCOUNT_NAME";

  public constructor(reason: string) {
    super(`invalid account name: ${reason}`);
  }
}
