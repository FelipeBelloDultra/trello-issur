import { UseCaseError } from "@/core/errors/use-case-error";

export class InvalidTokenError extends Error implements UseCaseError {
  public readonly code = "INVALID_TOKEN";

  public constructor() {
    super("Token is invalid or has expired");
  }
}
