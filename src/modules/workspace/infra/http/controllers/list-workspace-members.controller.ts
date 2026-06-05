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
import { ValidateWorkspaceMiddleware } from "@/infra/http/middlewares/validate-workspace.middleware";
import { ListWorkspaceMembersQuery } from "@/modules/workspace/application/queries/list-workspace-members/query";
import { WorkspaceMemberView } from "@/modules/workspace/application/repositories/workspace-member.repository";

import { WorkspaceMemberPresenter } from "../../presenters/workspace-member.presenter";

type ListResult = { members: WorkspaceMemberView[]; pagination: PaginationResult };

@injectable()
export class ListWorkspaceMembersController implements Controller {
  public readonly path = "/workspaces/:workspaceId/members";
  public readonly method: HttpMethod = "get";
  public readonly middlewares: RequestHandler[];

  public constructor(
    @inject(InjectionTokens.Bus.Query)
    private readonly queryBus: QueryBus,
    @inject(InjectionTokens.Middlewares.Auth)
    private readonly auth: AuthMiddleware,
    @inject(InjectionTokens.Middlewares.ValidateWorkspace)
    private readonly validateWorkspace: ValidateWorkspaceMiddleware,
    @inject(InjectionTokens.Middlewares.Pagination)
    private readonly paginationMiddleware: PaginationMiddleware,
  ) {
    this.middlewares = [auth.handle(), validateWorkspace.handle(), paginationMiddleware.handle()];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const { workspaceId } = req.params;

    if (!workspaceId || Array.isArray(workspaceId)) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Workspace.NotFound });
    }

    const pagination = req.pagination ?? Pagination.create({ page: 1, limit: 20 });

    const { members, pagination: paginationResult } = await this.queryBus.ask<ListResult>(
      new ListWorkspaceMembersQuery(workspaceId, pagination),
    );

    return res.status(200).json({
      data: members.map((m) => WorkspaceMemberPresenter.toHTTP(m)),
      pagination: paginationResult,
    });
  }
}
