import { UseCaseError } from "@/core/errors/use-case-error";

export class NotificationAccessDeniedError extends Error implements UseCaseError {
  public readonly code = "NOTIFICATION_ACCESS_DENIED";

  public constructor() {
    super("notification does not belong to account");
  }
}
