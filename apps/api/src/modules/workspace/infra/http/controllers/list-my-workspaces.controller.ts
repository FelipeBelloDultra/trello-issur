import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { QueryBus } from "@/core/queries/query-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { HttpMessages } from "@/infra/http/http-messages";
import { AuthMiddleware } from "@/infra/http/middlewares/auth.middleware";
import { MyWorkspaceView } from "@/modules/workspace/application/queries/list-my-workspaces/handler";
import { ListMyWorkspacesQuery } from "@/modules/workspace/application/queries/list-my-workspaces/query";

import { MyWorkspacePresenter } from "../../presenters/my-workspace.presenter";

@injectable()
export class ListMyWorkspacesController implements Controller {
  public readonly path = "/workspaces";
  public readonly method: HttpMethod = "get";
  public readonly middlewares: RequestHandler[];

  public constructor(
    @inject(InjectionTokens.Bus.Query)
    private readonly queryBus: QueryBus,
    @inject(InjectionTokens.Middlewares.Auth)
    private readonly auth: AuthMiddleware,
  ) {
    this.middlewares = [auth.handle()];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    if (!req.account) {
      throw new HttpException({ statusCode: 401, message: HttpMessages.Auth.Unauthorized });
    }

    const results = await this.queryBus.ask<MyWorkspaceView[]>(
      new ListMyWorkspacesQuery(req.account.sub),
    );

    return res.status(200).json({ data: results.map((r) => MyWorkspacePresenter.toHTTP(r)) });
  }
}
