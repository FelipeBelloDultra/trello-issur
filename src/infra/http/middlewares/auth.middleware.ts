import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { CryptographGateway } from "@/modules/auth/application/gateways/cryptograph.gateway";

import { Middleware } from "../contracts/middleware";
import { HttpException } from "../http-exception";

@injectable()
export class AuthMiddleware implements Middleware {
  public constructor(
    @inject(InjectionTokens.Gateways.Cryptograph)
    private readonly cryptograph: CryptographGateway,
  ) {}

  public handle() {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        throw new HttpException({ statusCode: 401, message: "Missing access token" });
      }

      const token = authHeader.slice(7);
      const claims = await this.cryptograph.verify(token);

      if (!claims) {
        throw new HttpException({ statusCode: 401, message: "Invalid or expired access token" });
      }

      req.account = claims;
      next();
    };
  }
}
