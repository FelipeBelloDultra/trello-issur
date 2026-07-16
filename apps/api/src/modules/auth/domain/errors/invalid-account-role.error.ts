import { DomainError } from "@/core/errors/domain-error";

export class InvalidAccountRoleError extends DomainError {
  public readonly code = "INVALID_ACCOUNT_ROLE";
  public constructor(value: string) {
    super(`unknown role: "${value}"`);
  }
}
