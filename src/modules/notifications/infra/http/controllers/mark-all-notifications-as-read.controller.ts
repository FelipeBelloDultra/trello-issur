import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { AuthMiddleware } from "@/infra/http/middlewares/auth.middleware";
import { MarkAllNotificationsAsReadCommand } from "@/modules/notifications/application/commands/mark-all-notifications-as-read/command";

@injectable()
export class MarkAllNotificationsAsReadController implements Controller {
  public readonly path = "/notifications/read-all";
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
    const accountId = req.account!.sub;

    await this.commandBus.dispatch(new MarkAllNotificationsAsReadCommand(accountId));

    return res.status(204).send();
  }
}
