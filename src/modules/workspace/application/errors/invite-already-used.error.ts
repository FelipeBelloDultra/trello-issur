import { UseCaseError } from "@/core/errors/use-case-error";

export class InviteAlreadyUsedError extends Error implements UseCaseError {
  public readonly code = "INVITE_ALREADY_USED";

  public constructor() {
    super("invite has already been used");
  }
}
