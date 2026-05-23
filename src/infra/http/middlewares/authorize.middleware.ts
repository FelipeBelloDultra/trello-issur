import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { AccountRoleRepository } from "@/modules/auth/application/repositories/account-role-repository";
import { RawPermissionKey } from "@/modules/auth/domain/value-objects/permission-key";

import { HttpException } from "../http-exception";
import { Middleware } from "../middleware";

@injectable()
export class AuthorizeMiddleware implements Middleware<RawPermissionKey[]> {
  public constructor(
    @inject(InjectionTokens.Repositories.AccountRole)
    private readonly accountRoleRepository: AccountRoleRepository,
  ) {}

  public handle(required: RawPermissionKey[]) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      const { account } = req;

      if (!account) {
        throw new HttpException({ statusCode: 401, message: "Unauthorized" });
      }

      const workspaceId = req.params.workspaceId;

      if (!workspaceId || Array.isArray(workspaceId)) {
        throw new HttpException({ statusCode: 403, message: "Missing workspace context" });
      }

      const permissions = await this.accountRoleRepository.findPermissions(account.sub, workspaceId);

      const hasAll = required.every((perm) => permissions.includes(perm));

      if (!hasAll) {
        throw new HttpException({ statusCode: 403, message: "Forbidden" });
      }

      next();
    };
  }
}
