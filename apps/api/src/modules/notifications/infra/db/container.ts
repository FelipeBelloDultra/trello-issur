import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { DrizzleNotificationRepository } from "./repositories/drizzle-notification.repository";

export function setupDatabaseNotificationsContainer(): void {
  container.register(
    InjectionTokens.Repositories.Notification,
    { useClass: DrizzleNotificationRepository },
    { lifecycle: Lifecycle.Singleton },
  );
}
