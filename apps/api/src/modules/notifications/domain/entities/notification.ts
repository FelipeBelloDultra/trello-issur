import { Entity } from "@/core/entity/entity";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";

export type NotificationType = "workspace_invite" | "workspace_invite_accepted";

interface NotificationProps {
  accountId: UniqueEntityID;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, string>;
  readAt: Date | null;
  createdAt: Date;
}

export class Notification extends Entity<NotificationProps> {
  public get accountId(): UniqueEntityID {
    return this.props.accountId;
  }

  public get type(): NotificationType {
    return this.props.type;
  }

  public get title(): string {
    return this.props.title;
  }

  public get body(): string {
    return this.props.body;
  }

  public get metadata(): Record<string, string> {
    return this.props.metadata;
  }

  public get readAt(): Date | null {
    return this.props.readAt;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public isRead(): boolean {
    return this.props.readAt !== null;
  }

  public markAsRead(): void {
    if (this.props.readAt !== null) return;
    this.props.readAt = new Date();
  }

  private constructor(props: NotificationProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: Omit<NotificationProps, "readAt" | "createdAt">,
    id?: UniqueEntityID,
  ): Notification {
    return new Notification({ ...props, readAt: null, createdAt: new Date() }, id);
  }

  public static restore(props: NotificationProps, id: UniqueEntityID): Notification {
    return new Notification(props, id);
  }
}
