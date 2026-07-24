import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { CryptographGateway } from "@/modules/auth/application/gateways/cryptograph.gateway";
import { AccessTokenRepository } from "@/modules/auth/application/repositories/access-token.repository";
import { ACCESS_TOKEN_COOKIE } from "@/modules/auth/infra/http/access-token-cookie";

import { Middleware } from "../contracts/middleware";
import { HttpException } from "../http-exception";

@injectable()
export class AuthMiddleware implements Middleware {
  public constructor(
    @inject(InjectionTokens.Gateways.Cryptograph)
    private readonly cryptograph: CryptographGateway,
    @inject(InjectionTokens.Repositories.AccessToken)
    private readonly accessTokenRepository: AccessTokenRepository,
  ) {}

  public handle() {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      const token = req.cookies[ACCESS_TOKEN_COOKIE] as string | undefined;

      if (!token) {
        throw new HttpException({ statusCode: 401, message: "Missing access token" });
      }

      const claims = await this.cryptograph.verify(token);

      if (!claims) {
        throw new HttpException({ statusCode: 401, message: "Invalid or expired access token" });
      }

      const isValid = await this.accessTokenRepository.matches(claims.sub, token);

      if (!isValid) {
        throw new HttpException({ statusCode: 401, message: "Invalid or expired access token" });
      }

      req.account = claims;
      next();
    };
  }
}
