import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { Pagination, PaginationResult } from "@/core/entity/pagination";
import { QueryBus } from "@/core/queries/query-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { HttpMessages } from "@/infra/http/http-messages";
import { AuthMiddleware } from "@/infra/http/middlewares/auth.middleware";
import { PaginationMiddleware } from "@/infra/http/middlewares/pagination.middleware";
import { ListMyInvitesQuery } from "@/modules/workspace/application/queries/list-my-invites/query";
import { MyWorkspaceInviteView } from "@/modules/workspace/application/repositories/workspace-invite.repository";

import { MyWorkspaceInvitePresenter } from "../../presenters/my-workspace-invite.presenter";

type ListResult = { invites: MyWorkspaceInviteView[]; pagination: PaginationResult };

@injectable()
export class ListMyInvitesController implements Controller {
  public readonly path = "/invites/mine";
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
    if (!req.account) {
      throw new HttpException({ statusCode: 401, message: HttpMessages.Auth.Unauthorized });
    }

    const pagination = req.pagination ?? Pagination.create({ page: 1, limit: 20 });

    const { invites, pagination: paginationResult } = await this.queryBus.ask<ListResult>(
      new ListMyInvitesQuery(req.account.email, pagination),
    );

    return res.status(200).json({
      data: invites.map((i) => MyWorkspaceInvitePresenter.toHTTP(i)),
      pagination: paginationResult,
    });
  }
}
