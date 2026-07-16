import { inject, injectable } from "tsyringe";

import { PaginationResult } from "@/core/entity/pagination";
import { QueryHandler } from "@/core/queries/query-handler";
import { InjectionTokens } from "@/infra/container/tokens";

import {
  NotificationRepository,
  NotificationView,
} from "../../repositories/notification.repository";

import { ListNotificationsQuery } from "./query";

type Result = { notifications: NotificationView[]; pagination: PaginationResult };

@injectable()
export class ListNotificationsHandler implements QueryHandler<ListNotificationsQuery, Result> {
  public constructor(
    @inject(InjectionTokens.Repositories.Notification)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  public async execute(query: ListNotificationsQuery): Promise<Result> {
    const { notifications, total } = await this.notificationRepository.findManyByAccount(
      query.accountId,
      query.pagination,
      query.read,
    );

    return { notifications, pagination: query.pagination.calculate(total) };
  }
}
