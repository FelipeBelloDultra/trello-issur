import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { QueryBus } from "@/core/queries/query-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { HttpMessages } from "@/infra/http/http-messages";
import { AuthMiddleware } from "@/infra/http/middlewares/auth.middleware";
import { ValidateWorkspaceMiddleware } from "@/infra/http/middlewares/validate-workspace.middleware";
import { GetBoardResult } from "@/modules/board/application/queries/get-board/handler";
import { GetBoardQuery } from "@/modules/board/application/queries/get-board/query";
import { ResolveBoardWorkspaceMiddleware } from "@/modules/board/infra/http/middlewares/resolve-board-workspace.middleware";

import { BoardPresenter } from "../../presenters/board.presenter";

@injectable()
export class GetBoardController implements Controller {
  public readonly path = "/boards/:boardId";
  public readonly method: HttpMethod = "get";
  public readonly middlewares: RequestHandler[];

  public constructor(
    @inject(InjectionTokens.Bus.Query)
    private readonly queryBus: QueryBus,
    @inject(InjectionTokens.Middlewares.Auth)
    private readonly auth: AuthMiddleware,
    @inject(InjectionTokens.Middlewares.ResolveBoardWorkspace)
    private readonly resolveBoardWorkspace: ResolveBoardWorkspaceMiddleware,
    @inject(InjectionTokens.Middlewares.ValidateWorkspace)
    private readonly validateWorkspace: ValidateWorkspaceMiddleware,
  ) {
    this.middlewares = [auth.handle(), resolveBoardWorkspace.handle(), validateWorkspace.handle()];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const { boardId } = req.params;

    if (!boardId || Array.isArray(boardId)) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Board.NotFound });
    }

    const result = await this.queryBus.ask<GetBoardResult | null>(new GetBoardQuery(boardId));

    if (!result) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Board.NotFound });
    }

    return res.status(200).json({ data: BoardPresenter.toHTTPWithDetails(result) });
  }
}
