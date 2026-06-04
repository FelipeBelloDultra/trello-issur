import { UseCaseError } from "@/core/errors/use-case-error";

export class WorkspaceNotFoundError extends Error implements UseCaseError {
  public readonly code = "WORKSPACE_NOT_FOUND";

  public constructor() {
    super("Workspace not found.");
  }
}
