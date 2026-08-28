import { UseCaseError } from "@/core/errors/use-case-error";

export class AccountNotWorkspaceMemberError extends Error implements UseCaseError {
  public readonly code = "ACCOUNT_NOT_WORKSPACE_MEMBER";

  public constructor() {
    super("Assignee account is not a member of the board's workspace.");
  }
}
