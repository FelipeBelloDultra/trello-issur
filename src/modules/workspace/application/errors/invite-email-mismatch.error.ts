import { UseCaseError } from "@/core/errors/use-case-error";

export class InviteEmailMismatchError extends Error implements UseCaseError {
  public readonly code = "INVITE_EMAIL_MISMATCH";

  public constructor() {
    super("this invite was not sent to your email address");
  }
}
