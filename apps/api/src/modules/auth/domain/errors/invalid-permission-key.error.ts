import { DomainError } from "@/core/errors/domain-error";

export class InvalidPermissionKeyError extends DomainError {
  public readonly code = "INVALID_PERMISSION_KEY";
  public constructor(value: string) {
    super(`unknown permission key: "${value}"`);
  }
}
