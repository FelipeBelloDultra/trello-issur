import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { QueryBus } from "@/core/queries/query-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { HttpMessages } from "@/infra/http/http-messages";
import { AuthMiddleware } from "@/infra/http/middlewares/auth.middleware";
import { ValidateWorkspaceMiddleware } from "@/infra/http/middlewares/validate-workspace.middleware";
import { MembershipView } from "@/modules/workspace/application/queries/get-my-membership/handler";
import { GetMyMembershipQuery } from "@/modules/workspace/application/queries/get-my-membership/query";

@injectable()
export class GetMyWorkspaceMembershipController implements Controller {
  public readonly path = "/workspaces/:workspaceId/me";
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
    if (!req.account) {
      throw new HttpException({ statusCode: 401, message: HttpMessages.Auth.Unauthorized });
    }

    const { workspaceId } = req.params;

    if (!workspaceId || Array.isArray(workspaceId)) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Workspace.NotFound });
    }

    const membership = await this.queryBus.ask<MembershipView>(
      new GetMyMembershipQuery(req.account.sub, workspaceId),
    );

    return res.status(200).json({ data: membership });
  }
}
