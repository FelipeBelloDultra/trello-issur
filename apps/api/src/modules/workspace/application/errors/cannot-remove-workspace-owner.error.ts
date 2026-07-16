import { UseCaseError } from "@/core/errors/use-case-error";

export class CannotRemoveWorkspaceOwnerError extends Error implements UseCaseError {
  public readonly code = "CANNOT_REMOVE_WORKSPACE_OWNER";
  public constructor() {
    super("workspace owner cannot be removed");
  }
}
