import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { Pagination, PaginationResult } from "@/core/entity/pagination";
import { QueryBus } from "@/core/queries/query-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { HttpMessages } from "@/infra/http/http-messages";
import { AuthMiddleware } from "@/infra/http/middlewares/auth.middleware";
import { AuthorizeMiddleware } from "@/infra/http/middlewares/authorize.middleware";
import { PaginationMiddleware } from "@/infra/http/middlewares/pagination.middleware";
import { ValidateWorkspaceMiddleware } from "@/infra/http/middlewares/validate-workspace.middleware";
import { ListWorkspaceInvitesQuery } from "@/modules/workspace/application/queries/list-workspace-invites/query";
import { WorkspaceInviteView } from "@/modules/workspace/application/repositories/workspace-invite.repository";

import { WorkspaceInvitePresenter } from "../../presenters/workspace-invite.presenter";

type ListResult = { invites: WorkspaceInviteView[]; pagination: PaginationResult };

@injectable()
export class ListWorkspaceInvitesController implements Controller {
  public readonly path = "/workspaces/:workspaceId/invites";
  public readonly method: HttpMethod = "get";
  public readonly middlewares: RequestHandler[];

  public constructor(
    @inject(InjectionTokens.Bus.Query)
    private readonly queryBus: QueryBus,
    @inject(InjectionTokens.Middlewares.Auth)
    private readonly auth: AuthMiddleware,
    @inject(InjectionTokens.Middlewares.ValidateWorkspace)
    private readonly validateWorkspace: ValidateWorkspaceMiddleware,
    @inject(InjectionTokens.Middlewares.Authorize)
    private readonly authorize: AuthorizeMiddleware,
    @inject(InjectionTokens.Middlewares.Pagination)
    private readonly paginationMiddleware: PaginationMiddleware,
  ) {
    this.middlewares = [
      auth.handle(),
      validateWorkspace.handle(),
      authorize.handle(["workspace:manage"]),
      paginationMiddleware.handle(),
    ];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const { workspaceId } = req.params;

    if (!workspaceId || Array.isArray(workspaceId)) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Workspace.NotFound });
    }

    const pagination = req.pagination ?? Pagination.create({ page: 1, limit: 20 });

    const { invites, pagination: paginationResult } = await this.queryBus.ask<ListResult>(
      new ListWorkspaceInvitesQuery(workspaceId, pagination),
    );

    return res.status(200).json({
      data: invites.map((i) => WorkspaceInvitePresenter.toHTTP(i)),
      pagination: paginationResult,
    });
  }
}
