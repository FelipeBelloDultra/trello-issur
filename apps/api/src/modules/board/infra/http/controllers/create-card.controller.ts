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
import { CreateCardCommand } from "@/modules/board/application/commands/create-card/command";
import { CreateCardDto } from "@/modules/board/application/dtos/create-card.dto";
import { ColumnNotFoundError } from "@/modules/board/application/errors/column-not-found.error";
import { Card } from "@/modules/board/domain/entities/card";
import { ResolveBoardWorkspaceMiddleware } from "@/modules/board/infra/http/middlewares/resolve-board-workspace.middleware";

import { CardPresenter } from "../../presenters/card.presenter";

type OnError = ColumnNotFoundError;

@injectable()
export class CreateCardController implements Controller {
  public readonly path = "/columns/:columnId/cards";
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
      authorize.handle(["card:create"]),
    ];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const { columnId } = req.params;

    if (!columnId || Array.isArray(columnId)) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Column.NotFound });
    }

    const dto = CreateCardDto.parse(req.body);

    const result = await this.commandBus.dispatch<Either<OnError, { card: Card }>>(
      new CreateCardCommand({ columnId, title: dto.title, description: dto.description }),
    );

    if (result.isLeft()) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Column.NotFound });
    }

    return res.status(201).json({ data: CardPresenter.toHTTP(result.value.card) });
  }
}
