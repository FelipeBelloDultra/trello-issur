import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { ListNotificationsController } from "./controllers/list-notifications.controller";
import { MarkAllNotificationsAsReadController } from "./controllers/mark-all-notifications-as-read.controller";
import { MarkNotificationAsReadController } from "./controllers/mark-notification-as-read.controller";

export function setupHTTPNotificationsContainer(): void {
  container.register(
    InjectionTokens.Controllers.ListNotifications,
    { useClass: ListNotificationsController },
    { lifecycle: Lifecycle.Singleton },
  );
  container.register(
    InjectionTokens.Controllers.MarkNotificationAsRead,
    { useClass: MarkNotificationAsReadController },
    { lifecycle: Lifecycle.Singleton },
  );
  container.register(
    InjectionTokens.Controllers.MarkAllNotificationsAsRead,
    { useClass: MarkAllNotificationsAsReadController },
    { lifecycle: Lifecycle.Singleton },
  );
}
