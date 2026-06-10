import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";

import { NotificationRepository } from "../../repositories/notification.repository";

import { CreateNotificationCommand } from "./command";

type OnError = never;
type OnSuccess = void;
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class CreateNotificationHandler implements CommandHandler<
  CreateNotificationCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.Notification)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  public async execute(command: CreateNotificationCommand): Output {
    await this.notificationRepository.create(command.props);
    return right();
  }
}
