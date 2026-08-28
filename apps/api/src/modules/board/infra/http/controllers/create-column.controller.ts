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
import { CreateColumnCommand } from "@/modules/board/application/commands/create-column/command";
import { CreateColumnDto } from "@/modules/board/application/dtos/create-column.dto";
import { Column } from "@/modules/board/domain/entities/column";
import { ResolveBoardWorkspaceMiddleware } from "@/modules/board/infra/http/middlewares/resolve-board-workspace.middleware";

import { ColumnPresenter } from "../../presenters/column.presenter";

@injectable()
export class CreateColumnController implements Controller {
  public readonly path = "/boards/:boardId/columns";
  public readonly method: HttpMethod = "post";
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
      authorize.handle(["board:edit"]),
    ];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const { boardId } = req.params;

    if (!boardId || Array.isArray(boardId)) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Board.NotFound });
    }

    const dto = CreateColumnDto.parse(req.body);

    const { column } = await this.commandBus.dispatch<{ column: Column }>(
      new CreateColumnCommand({ boardId, name: dto.name }),
    );

    return res.status(201).json({ data: ColumnPresenter.toHTTP(column) });
  }
}
