import { UseCaseError } from "@/core/errors/use-case-error";

export class WorkspaceMemberNotFoundError extends Error implements UseCaseError {
  public readonly code = "WORKSPACE_MEMBER_NOT_FOUND";
  public constructor() {
    super("workspace member not found");
  }
}
