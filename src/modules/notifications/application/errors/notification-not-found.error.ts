import { UseCaseError } from "@/core/errors/use-case-error";

export class NotificationNotFoundError extends Error implements UseCaseError {
  public readonly code = "NOTIFICATION_NOT_FOUND";

  public constructor() {
    super("notification not found");
  }
}
