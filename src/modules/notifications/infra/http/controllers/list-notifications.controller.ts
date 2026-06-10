import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { Pagination, PaginationResult } from "@/core/entity/pagination";
import { QueryBus } from "@/core/queries/query-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { AuthMiddleware } from "@/infra/http/middlewares/auth.middleware";
import { PaginationMiddleware } from "@/infra/http/middlewares/pagination.middleware";
import { ListNotificationsQuery } from "@/modules/notifications/application/queries/list-notifications/query";
import { NotificationView } from "@/modules/notifications/application/repositories/notification.repository";

import { NotificationPresenter } from "../../presenters/notification.presenter";

type ListResult = { notifications: NotificationView[]; pagination: PaginationResult };

@injectable()
export class ListNotificationsController implements Controller {
  public readonly path = "/notifications";
  public readonly method: HttpMethod = "get";
  public readonly middlewares: RequestHandler[];

  public constructor(
    @inject(InjectionTokens.Bus.Query)
    private readonly queryBus: QueryBus,
    @inject(InjectionTokens.Middlewares.Auth)
    private readonly auth: AuthMiddleware,
    @inject(InjectionTokens.Middlewares.Pagination)
    private readonly paginationMiddleware: PaginationMiddleware,
  ) {
    this.middlewares = [auth.handle(), paginationMiddleware.handle()];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const accountId = req.account!.sub;
    const pagination = req.pagination ?? Pagination.create({ page: 1, limit: 20 });

    const readParam = req.query["read"];
    const read = readParam === "true" ? true : readParam === "false" ? false : undefined;

    const { notifications, pagination: paginationResult } = await this.queryBus.ask<ListResult>(
      new ListNotificationsQuery(accountId, pagination, read),
    );

    return res.status(200).json({
      data: notifications.map((n) => NotificationPresenter.toHTTP(n)),
      pagination: paginationResult,
    });
  }
}
