import { UseCaseError } from "@/core/errors/use-case-error";

export class InvalidInviteActionError extends Error implements UseCaseError {
  public readonly code = "INVALID_INVITE_ACTION";

  public constructor() {
    super("invalid invite action");
  }
}
