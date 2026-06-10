import { Pagination } from "@/core/entity/pagination";

import { Notification, NotificationType } from "../../domain/entities/notification";

export type NotificationView = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, string>;
  readAt: Date | null;
  createdAt: Date;
};

export type CreateNotificationOptions = {
  accountId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, string>;
};

export interface NotificationRepository {
  create(options: CreateNotificationOptions): Promise<void>;
  findById(id: string): Promise<Notification | null>;
  findManyByAccount(
    accountId: string,
    pagination: Pagination,
    read?: boolean,
  ): Promise<{ notifications: NotificationView[]; total: number }>;
  save(notification: Notification): Promise<void>;
  markAllAsReadByAccount(accountId: string): Promise<void>;
}
