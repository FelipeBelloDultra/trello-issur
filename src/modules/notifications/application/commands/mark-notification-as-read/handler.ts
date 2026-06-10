import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";

import { NotificationAccessDeniedError } from "../../errors/notification-access-denied.error";
import { NotificationNotFoundError } from "../../errors/notification-not-found.error";
import { NotificationRepository } from "../../repositories/notification.repository";

import { MarkNotificationAsReadCommand } from "./command";

type OnError = NotificationNotFoundError | NotificationAccessDeniedError;
type OnSuccess = void;
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class MarkNotificationAsReadHandler implements CommandHandler<
  MarkNotificationAsReadCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.Notification)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  public async execute(command: MarkNotificationAsReadCommand): Output {
    const notification = await this.notificationRepository.findById(command.notificationId);

    if (!notification) {
      return left(new NotificationNotFoundError());
    }

    if (notification.accountId.toValue() !== command.accountId) {
      return left(new NotificationAccessDeniedError());
    }

    notification.markAsRead();
    await this.notificationRepository.save(notification);

    return right();
  }
}
