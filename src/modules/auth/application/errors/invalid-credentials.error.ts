import { UseCaseError } from "@/core/errors/use-case-error";

export class InvalidCredentialsError extends Error implements UseCaseError {
  public readonly code = "INVALID_CREDENTIALS";

  public constructor() {
    super("Invalid email or password");
  }
}
