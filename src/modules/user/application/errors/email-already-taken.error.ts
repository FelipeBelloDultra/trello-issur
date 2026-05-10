import { UseCaseError } from "@/core/errors/use-case-error";

export class EmailAlreadyTakenError extends Error implements UseCaseError {
  public readonly code = "EMAIL_ALREADY_TAKEN";

  public constructor(email: string) {
    super(`Email "${email}" is already taken`);
  }
}
