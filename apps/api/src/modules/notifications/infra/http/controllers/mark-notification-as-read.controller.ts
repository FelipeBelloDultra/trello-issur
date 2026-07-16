import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { Either } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { HttpMessages } from "@/infra/http/http-messages";
import { AuthMiddleware } from "@/infra/http/middlewares/auth.middleware";
import { MarkNotificationAsReadCommand } from "@/modules/notifications/application/commands/mark-notification-as-read/command";
import { NotificationAccessDeniedError } from "@/modules/notifications/application/errors/notification-access-denied.error";
import { NotificationNotFoundError } from "@/modules/notifications/application/errors/notification-not-found.error";

type OnError = NotificationNotFoundError | NotificationAccessDeniedError;

@injectable()
export class MarkNotificationAsReadController implements Controller {
  public readonly path = "/notifications/:notificationId/read";
  public readonly method: HttpMethod = "patch";
  public readonly middlewares: RequestHandler[];

  public constructor(
    @inject(InjectionTokens.Bus.Command)
    private readonly commandBus: CommandBus,
    @inject(InjectionTokens.Middlewares.Auth)
    private readonly auth: AuthMiddleware,
  ) {
    this.middlewares = [auth.handle()];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const { notificationId } = req.params;

    if (!notificationId || Array.isArray(notificationId)) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Notification.NotFound });
    }

    const accountId = req.account!.sub;

    const result = await this.commandBus.dispatch<Either<OnError, void>>(
      new MarkNotificationAsReadCommand(notificationId, accountId),
    );

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof NotificationNotFoundError) {
        throw new HttpException({ statusCode: 404, message: HttpMessages.Notification.NotFound });
      }

      throw new HttpException({ statusCode: 403, message: HttpMessages.Notification.AccessDenied });
    }

    return res.status(204).send();
  }
}
