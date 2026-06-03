import { UseCaseError } from "@/core/errors/use-case-error";

export class WorkspaceSlugAlreadyTakenError extends Error implements UseCaseError {
  public readonly code = "WORKSPACE_SLUG_ALREADY_TAKEN";

  public constructor(slug: string) {
    super(`Workspace slug "${slug}" is already taken`);
  }
}
