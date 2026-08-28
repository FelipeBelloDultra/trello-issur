import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { Either } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { HttpMessages } from "@/infra/http/http-messages";
import { AuthMiddleware } from "@/infra/http/middlewares/auth.middleware";
import { AuthorizeMiddleware } from "@/infra/http/middlewares/authorize.middleware";
import { ValidateWorkspaceMiddleware } from "@/infra/http/middlewares/validate-workspace.middleware";
import { DeleteBoardCommand } from "@/modules/board/application/commands/delete-board/command";
import { BoardNotFoundError } from "@/modules/board/application/errors/board-not-found.error";
import { ResolveBoardWorkspaceMiddleware } from "@/modules/board/infra/http/middlewares/resolve-board-workspace.middleware";

type OnError = BoardNotFoundError;

@injectable()
export class DeleteBoardController implements Controller {
  public readonly path = "/boards/:boardId";
  public readonly method: HttpMethod = "delete";
  public readonly middlewares: RequestHandler[];

  public constructor(
    @inject(InjectionTokens.Bus.Command)
    private readonly commandBus: CommandBus,
    @inject(InjectionTokens.Middlewares.Auth)
    private readonly auth: AuthMiddleware,
    @inject(InjectionTokens.Middlewares.ResolveBoardWorkspace)
    private readonly resolveBoardWorkspace: ResolveBoardWorkspaceMiddleware,
    @inject(InjectionTokens.Middlewares.ValidateWorkspace)
    private readonly validateWorkspace: ValidateWorkspaceMiddleware,
    @inject(InjectionTokens.Middlewares.Authorize)
    private readonly authorize: AuthorizeMiddleware,
  ) {
    this.middlewares = [
      auth.handle(),
      resolveBoardWorkspace.handle(),
      validateWorkspace.handle(),
      authorize.handle(["board:delete"]),
    ];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const { boardId } = req.params;

    if (!boardId || Array.isArray(boardId)) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Board.NotFound });
    }

    const result = await this.commandBus.dispatch<Either<OnError, void>>(
      new DeleteBoardCommand(boardId),
    );

    if (result.isLeft()) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Board.NotFound });
    }

    return res.status(204).send();
  }
}
