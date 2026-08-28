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
import { MoveCardCommand } from "@/modules/board/application/commands/move-card/command";
import { MoveCardDto } from "@/modules/board/application/dtos/move-card.dto";
import { CardNotFoundError } from "@/modules/board/application/errors/card-not-found.error";
import { ColumnNotFoundError } from "@/modules/board/application/errors/column-not-found.error";
import { ColumnNotInBoardError } from "@/modules/board/application/errors/column-not-in-board.error";
import { Card } from "@/modules/board/domain/entities/card";
import { ResolveBoardWorkspaceMiddleware } from "@/modules/board/infra/http/middlewares/resolve-board-workspace.middleware";

import { CardPresenter } from "../../presenters/card.presenter";

type OnError = CardNotFoundError | ColumnNotFoundError | ColumnNotInBoardError;

@injectable()
export class MoveCardController implements Controller {
  public readonly path = "/cards/:cardId/move";
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
      authorize.handle(["card:move"]),
    ];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const { cardId } = req.params;

    if (!cardId || Array.isArray(cardId)) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Card.NotFound });
    }

    const dto = MoveCardDto.parse(req.body);

    const result = await this.commandBus.dispatch<Either<OnError, { card: Card }>>(
      new MoveCardCommand({ cardId, columnId: dto.columnId, position: dto.position }),
    );

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof CardNotFoundError) {
        throw new HttpException({ statusCode: 404, message: HttpMessages.Card.NotFound });
      }

      if (error instanceof ColumnNotFoundError) {
        throw new HttpException({ statusCode: 404, message: HttpMessages.Column.NotFound });
      }

      throw new HttpException({ statusCode: 409, message: HttpMessages.Column.NotInBoard });
    }

    return res.status(200).json({ data: CardPresenter.toHTTP(result.value.card) });
  }
}
