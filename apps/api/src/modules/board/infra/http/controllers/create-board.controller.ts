import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { HttpMessages } from "@/infra/http/http-messages";
import { AuthMiddleware } from "@/infra/http/middlewares/auth.middleware";
import { AuthorizeMiddleware } from "@/infra/http/middlewares/authorize.middleware";
import { ValidateWorkspaceMiddleware } from "@/infra/http/middlewares/validate-workspace.middleware";
import { CreateBoardCommand } from "@/modules/board/application/commands/create-board/command";
import { CreateBoardDto } from "@/modules/board/application/dtos/create-board.dto";
import { Board } from "@/modules/board/domain/entities/board";

import { BoardPresenter } from "../../presenters/board.presenter";

@injectable()
export class CreateBoardController implements Controller {
  public readonly path = "/workspaces/:workspaceId/boards";
  public readonly method: HttpMethod = "post";
  public readonly middlewares: RequestHandler[];

  public constructor(
    @inject(InjectionTokens.Bus.Command)
    private readonly commandBus: CommandBus,
    @inject(InjectionTokens.Middlewares.Auth)
    private readonly auth: AuthMiddleware,
    @inject(InjectionTokens.Middlewares.ValidateWorkspace)
    private readonly validateWorkspace: ValidateWorkspaceMiddleware,
    @inject(InjectionTokens.Middlewares.Authorize)
    private readonly authorize: AuthorizeMiddleware,
  ) {
    this.middlewares = [
      auth.handle(),
      validateWorkspace.handle(),
      authorize.handle(["board:create"]),
    ];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const { workspaceId } = req.params;

    if (!workspaceId || Array.isArray(workspaceId)) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Workspace.NotFound });
    }

    const dto = CreateBoardDto.parse(req.body);

    const { board } = await this.commandBus.dispatch<{ board: Board }>(
      new CreateBoardCommand({ workspaceId, name: dto.name }),
    );

    return res.status(201).json({ data: BoardPresenter.toHTTP(board) });
  }
}
