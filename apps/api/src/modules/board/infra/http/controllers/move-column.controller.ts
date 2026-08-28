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
import { MoveColumnCommand } from "@/modules/board/application/commands/move-column/command";
import { MoveColumnDto } from "@/modules/board/application/dtos/move-column.dto";
import { ColumnNotFoundError } from "@/modules/board/application/errors/column-not-found.error";
import { Column } from "@/modules/board/domain/entities/column";
import { ResolveBoardWorkspaceMiddleware } from "@/modules/board/infra/http/middlewares/resolve-board-workspace.middleware";

import { ColumnPresenter } from "../../presenters/column.presenter";

type OnError = ColumnNotFoundError;

@injectable()
export class MoveColumnController implements Controller {
  public readonly path = "/columns/:columnId";
  public readonly method: HttpMethod = "patch";
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
    const { columnId } = req.params;

    if (!columnId || Array.isArray(columnId)) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Column.NotFound });
    }

    const dto = MoveColumnDto.parse(req.body);

    const result = await this.commandBus.dispatch<Either<OnError, { column: Column }>>(
      new MoveColumnCommand({ columnId, name: dto.name, position: dto.position }),
    );

    if (result.isLeft()) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Column.NotFound });
    }

    return res.status(200).json({ data: ColumnPresenter.toHTTP(result.value.column) });
  }
}
