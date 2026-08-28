import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { QueryBus } from "@/core/queries/query-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { HttpMessages } from "@/infra/http/http-messages";
import { AuthMiddleware } from "@/infra/http/middlewares/auth.middleware";
import { ValidateWorkspaceMiddleware } from "@/infra/http/middlewares/validate-workspace.middleware";
import { ListWorkspaceBoardsQuery } from "@/modules/board/application/queries/list-workspace-boards/query";
import { Board } from "@/modules/board/domain/entities/board";

import { BoardPresenter } from "../../presenters/board.presenter";

@injectable()
export class ListWorkspaceBoardsController implements Controller {
  public readonly path = "/workspaces/:workspaceId/boards";
  public readonly method: HttpMethod = "get";
  public readonly middlewares: RequestHandler[];

  public constructor(
    @inject(InjectionTokens.Bus.Query)
    private readonly queryBus: QueryBus,
    @inject(InjectionTokens.Middlewares.Auth)
    private readonly auth: AuthMiddleware,
    @inject(InjectionTokens.Middlewares.ValidateWorkspace)
    private readonly validateWorkspace: ValidateWorkspaceMiddleware,
  ) {
    // No dedicated `board:view` permission key exists in the RBAC registry
    // (only create/edit/delete) — every workspace member can list its
    // boards, per spec.md's Clarifications. Membership alone gates this.
    this.middlewares = [auth.handle(), validateWorkspace.handle()];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const { workspaceId } = req.params;

    if (!workspaceId || Array.isArray(workspaceId)) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Workspace.NotFound });
    }

    const boards = await this.queryBus.ask<Board[]>(new ListWorkspaceBoardsQuery(workspaceId));

    return res.status(200).json({ data: boards.map((board) => BoardPresenter.toHTTP(board)) });
  }
}
