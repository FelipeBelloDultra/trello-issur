import { UseCaseError } from "@/core/errors/use-case-error";

export class AlreadyAMemberError extends Error implements UseCaseError {
  public readonly code = "ALREADY_A_MEMBER";

  public constructor() {
    super("account is already a member of this workspace");
  }
}
