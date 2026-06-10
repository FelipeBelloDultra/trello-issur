import { UniqueEntityID } from "@/core/entity/unique-entity-id";

import { Notification, NotificationType } from "../../../domain/entities/notification";

type NotificationRow = {
  id: string;
  accountId: string;
  type: string;
  title: string;
  body: string;
  metadata: unknown;
  readAt: Date | null;
  createdAt: Date;
};

export class NotificationMapper {
  public static toDomain(raw: NotificationRow): Notification {
    return Notification.restore(
      {
        accountId: UniqueEntityID.create(raw.accountId),
        type: raw.type as NotificationType,
        title: raw.title,
        body: raw.body,
        metadata: raw.metadata as Record<string, string>,
        readAt: raw.readAt,
        createdAt: raw.createdAt,
      },
      UniqueEntityID.create(raw.id),
    );
  }

  public static toPersistence(notification: Notification) {
    return {
      id: notification.id.toValue(),
      accountId: notification.accountId.toValue(),
      type: notification.type,
      title: notification.title,
      body: notification.body,
      metadata: notification.metadata,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }
}
