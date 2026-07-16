import { UseCaseError } from "@/core/errors/use-case-error";

export class InviteNotFoundError extends Error implements UseCaseError {
  public readonly code = "INVITE_NOT_FOUND";

  public constructor() {
    super("invite not found");
  }
}
