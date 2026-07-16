import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";

import { NotificationRepository } from "../../repositories/notification.repository";

import { MarkAllNotificationsAsReadCommand } from "./command";

type OnError = never;
type OnSuccess = void;
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class MarkAllNotificationsAsReadHandler implements CommandHandler<
  MarkAllNotificationsAsReadCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.Notification)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  public async execute(command: MarkAllNotificationsAsReadCommand): Output {
    await this.notificationRepository.markAllAsReadByAccount(command.accountId);
    return right(undefined);
  }
}
