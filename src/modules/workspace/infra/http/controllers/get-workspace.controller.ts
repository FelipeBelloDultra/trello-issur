import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { QueryBus } from "@/core/queries/query-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { HttpMessages } from "@/infra/http/http-messages";
import { AuthMiddleware } from "@/infra/http/middlewares/auth.middleware";
import { ValidateWorkspaceMiddleware } from "@/infra/http/middlewares/validate-workspace.middleware";
import { GetWorkspaceQuery } from "@/modules/workspace/application/queries/get-workspace/query";
import { Workspace } from "@/modules/workspace/domain/entities/workspace";

import { WorkspacePresenter } from "../../presenters/workspace.presenter";

@injectable()
export class GetWorkspaceController implements Controller {
  public readonly path = "/workspaces/:workspaceId";
  public readonly method: HttpMethod = "get";
  public readonly middlewares: RequestHandler[];

  public constructor(
    @inject(InjectionTokens.Bus.Query)
    private readonly queryBus: QueryBus,
    @inject(InjectionTokens.Middlewares.Auth)
    private readonly auth: AuthMiddleware,
    @inject(InjectionTokens.Middlewares.ValidateWorkspace)
    private readonly validateWorkspace: ValidateWorkspaceMiddleware,
  ) {
    this.middlewares = [auth.handle(), validateWorkspace.handle()];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const { workspaceId } = req.params;

    if (!workspaceId || Array.isArray(workspaceId)) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Workspace.NotFound });
    }

    const workspace = await this.queryBus.ask<Workspace | null>(new GetWorkspaceQuery(workspaceId));

    if (!workspace) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Workspace.NotFound });
    }

    return res.status(200).json({ data: WorkspacePresenter.toHTTP(workspace) });
  }
}
