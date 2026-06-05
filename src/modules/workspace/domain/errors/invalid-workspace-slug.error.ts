import { DomainError } from "@/core/errors/domain-error";

export class InvalidWorkspaceSlugError extends DomainError {
  public readonly code = "INVALID_WORKSPACE_SLUG";
  public constructor(reason: string) {
    super(`invalid workspace slug: ${reason}`);
  }
}
