import { UseCaseError } from "@/core/errors/use-case-error";

export class InviteExpiredError extends Error implements UseCaseError {
  public readonly code = "INVITE_EXPIRED";

  public constructor() {
    super("invite has expired");
  }
}
