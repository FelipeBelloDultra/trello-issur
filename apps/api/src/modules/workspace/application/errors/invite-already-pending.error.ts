import { UseCaseError } from "@/core/errors/use-case-error";

export class InviteAlreadyPendingError extends Error implements UseCaseError {
  public readonly code = "INVITE_ALREADY_PENDING";

  public constructor() {
    super("there is already a pending invite for this email");
  }
}
