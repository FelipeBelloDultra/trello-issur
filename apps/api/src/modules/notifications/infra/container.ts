import { container, Lifecycle } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { QueryBus } from "@/core/queries/query-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { CreateNotificationCommand } from "@/modules/notifications/application/commands/create-notification/command";
import { CreateNotificationHandler } from "@/modules/notifications/application/commands/create-notification/handler";
import { MarkAllNotificationsAsReadCommand } from "@/modules/notifications/application/commands/mark-all-notifications-as-read/command";
import { MarkAllNotificationsAsReadHandler } from "@/modules/notifications/application/commands/mark-all-notifications-as-read/handler";
import { MarkNotificationAsReadCommand } from "@/modules/notifications/application/commands/mark-notification-as-read/command";
import { MarkNotificationAsReadHandler } from "@/modules/notifications/application/commands/mark-notification-as-read/handler";
import { ListNotificationsHandler } from "@/modules/notifications/application/queries/list-notifications/handler";
import { ListNotificationsQuery } from "@/modules/notifications/application/queries/list-notifications/query";

import { setupDatabaseNotificationsContainer } from "./db/container";
import { setupHTTPNotificationsContainer } from "./http/container";

function registerNotificationHandlers(): void {
  container.register(
    InjectionTokens.Handlers.CreateNotification,
    { useClass: CreateNotificationHandler },
    { lifecycle: Lifecycle.Singleton },
  );
  container.register(
    InjectionTokens.Handlers.MarkNotificationAsRead,
    { useClass: MarkNotificationAsReadHandler },
    { lifecycle: Lifecycle.Singleton },
  );
  container.register(
    InjectionTokens.Handlers.MarkAllNotificationsAsRead,
    { useClass: MarkAllNotificationsAsReadHandler },
    { lifecycle: Lifecycle.Singleton },
  );
  container.register(
    InjectionTokens.Handlers.ListNotifications,
    { useClass: ListNotificationsHandler },
    { lifecycle: Lifecycle.Singleton },
  );
}

function wireNotificationBuses(): void {
  const commandBus = container.resolve<CommandBus>(InjectionTokens.Bus.Command);
  commandBus.register(
    CreateNotificationCommand,
    container.resolve<CreateNotificationHandler>(InjectionTokens.Handlers.CreateNotification),
  );
  commandBus.register(
    MarkNotificationAsReadCommand,
    container.resolve<MarkNotificationAsReadHandler>(
      InjectionTokens.Handlers.MarkNotificationAsRead,
    ),
  );
  commandBus.register(
    MarkAllNotificationsAsReadCommand,
    container.resolve<MarkAllNotificationsAsReadHandler>(
      InjectionTokens.Handlers.MarkAllNotificationsAsRead,
    ),
  );

  const queryBus = container.resolve<QueryBus>(InjectionTokens.Bus.Query);
  queryBus.register(
    ListNotificationsQuery,
    container.resolve<ListNotificationsHandler>(InjectionTokens.Handlers.ListNotifications),
  );
}

export function setupNotificationsModule(): void {
  setupDatabaseNotificationsContainer();
  registerNotificationHandlers();
  wireNotificationBuses();
  setupHTTPNotificationsContainer();
}
