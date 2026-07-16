import { UseCaseError } from "@/core/errors/use-case-error";

export class CannotUpdateOwnerRoleError extends Error implements UseCaseError {
  public readonly code = "CANNOT_UPDATE_OWNER_ROLE";
  public constructor() {
    super("workspace owner role cannot be changed");
  }
}
