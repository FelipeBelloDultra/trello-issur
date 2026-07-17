import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { z } from "zod";

import { InjectionTokens } from "@/infra/container/tokens";
import { AccountRoleRepository } from "@/modules/auth/application/repositories/account-role.repository";

import { Middleware } from "../contracts/middleware";
import { HttpException } from "../http-exception";
import { HttpMessages } from "../http-messages";

const workspaceIdSchema = z.uuid();

@injectable()
export class ValidateWorkspaceMiddleware implements Middleware {
  public constructor(
    @inject(InjectionTokens.Repositories.AccountRole)
    private readonly accountRoleRepository: AccountRoleRepository,
  ) {}

  public handle() {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      const { account } = req;

      if (!account) {
        throw new HttpException({ statusCode: 401, message: HttpMessages.Auth.Unauthorized });
      }

      const workspaceId = req.params.workspaceId;

      if (
        !workspaceId ||
        Array.isArray(workspaceId) ||
        !workspaceIdSchema.safeParse(workspaceId).success
      ) {
        throw new HttpException({ statusCode: 404, message: HttpMessages.Workspace.NotFound });
      }

      const member = await this.accountRoleRepository.isMember(account.sub, workspaceId);

      if (!member) {
        throw new HttpException({ statusCode: 404, message: HttpMessages.Workspace.NotFound });
      }

      next();
    };
  }
}
