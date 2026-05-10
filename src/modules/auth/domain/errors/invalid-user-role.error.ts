import { DomainError } from "@/core/errors/domain-error";

export class InvalidUserRoleError extends Error implements DomainError {
  public readonly code = "INVALID_USER_ROLE";

  public constructor(value: string) {
    super(`Unknown role: "${value}"`);
  }
}
