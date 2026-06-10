import { NotificationView } from "../../application/repositories/notification.repository";

export class NotificationPresenter {
  public static toHTTP(notification: NotificationView) {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      metadata: notification.metadata,
      read_at: notification.readAt,
      created_at: notification.createdAt,
    };
  }
}
