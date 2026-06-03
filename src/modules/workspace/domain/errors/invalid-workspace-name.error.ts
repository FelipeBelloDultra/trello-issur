import { DomainError } from "@/core/errors/domain-error";

export class InvalidWorkspaceNameError extends Error implements DomainError {
  public readonly code = "INVALID_WORKSPACE_NAME";

  public constructor(reason: string) {
    super(`Invalid workspace name: ${reason}`);
  }
}
