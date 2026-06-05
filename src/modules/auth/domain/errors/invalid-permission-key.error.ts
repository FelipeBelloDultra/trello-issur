import { DomainError } from "@/core/errors/domain-error";

export class InvalidPermissionKeyError extends Error implements DomainError {
  public readonly code = "INVALID_PERMISSION_KEY";

  public constructor(value: string) {
    super(`unknown permission key: "${value}"`);
  }
}
