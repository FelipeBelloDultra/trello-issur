import { UseCaseError } from "@/core/errors/use-case-error";

export class CannotRemoveSelfError extends Error implements UseCaseError {
  public readonly code = "CANNOT_REMOVE_SELF";

  public constructor() {
    super("you cannot remove yourself from the workspace");
  }
}
