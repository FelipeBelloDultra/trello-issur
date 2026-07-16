import { InjectionTokens } from "@/infra/container/tokens";

export const notificationControllers = [
  InjectionTokens.Controllers.ListNotifications,
  InjectionTokens.Controllers.MarkNotificationAsRead,
  InjectionTokens.Controllers.MarkAllNotificationsAsRead,
];
