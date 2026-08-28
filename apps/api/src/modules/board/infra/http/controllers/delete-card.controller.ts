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
import { DeleteCardCommand } from "@/modules/board/application/commands/delete-card/command";
import { CardNotFoundError } from "@/modules/board/application/errors/card-not-found.error";
import { ResolveBoardWorkspaceMiddleware } from "@/modules/board/infra/http/middlewares/resolve-board-workspace.middleware";

type OnError = CardNotFoundError;

@injectable()
export class DeleteCardController implements Controller {
  public readonly path = "/cards/:cardId";
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
      authorize.handle(["card:delete"]),
    ];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const { cardId } = req.params;

    if (!cardId || Array.isArray(cardId)) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Card.NotFound });
    }

    const result = await this.commandBus.dispatch<Either<OnError, void>>(
      new DeleteCardCommand(cardId),
    );

    if (result.isLeft()) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Card.NotFound });
    }

    return res.status(204).send();
  }
}
