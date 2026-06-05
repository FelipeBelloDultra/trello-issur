import { DomainError } from "@/core/errors/domain-error";

export class InvalidEmailError extends Error implements DomainError {
  public readonly code = "INVALID_EMAIL";

  public constructor(value: string) {
    super(`invalid email: "${value}"`);
  }
}
