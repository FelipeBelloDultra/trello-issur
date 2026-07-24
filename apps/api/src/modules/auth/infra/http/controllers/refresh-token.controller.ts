import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { Either } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { HttpMessages } from "@/infra/http/http-messages";
import { IdempotencyMiddleware } from "@/infra/http/middlewares/idempotency.middleware";
import { RateLimitMiddleware } from "@/infra/http/middlewares/rate-limit.middleware";
import { RefreshTokenCommand } from "@/modules/auth/application/commands/refresh-token/command";
import { InvalidTokenError } from "@/modules/auth/application/errors/invalid-token.error";
import { TokenPair } from "@/modules/auth/domain/value-objects/token-pair";

import { ACCESS_TOKEN_COOKIE, accessTokenCookieOptions } from "../access-token-cookie";
import { REFRESH_TOKEN_COOKIE, refreshTokenCookieOptions } from "../refresh-token-cookie";

@injectable()
export class RefreshTokenController implements Controller {
  public readonly path = "/auth/refresh";
  public readonly method: HttpMethod = "post";
  public readonly middlewares: RequestHandler[];

  public constructor(
    @inject(InjectionTokens.Bus.Command)
    private readonly commandBus: CommandBus,
    @inject(InjectionTokens.Middlewares.RateLimit)
    private readonly rateLimit: RateLimitMiddleware,
    @inject(InjectionTokens.Middlewares.Idempotency)
    private readonly idempotency: IdempotencyMiddleware,
  ) {
    this.middlewares = [
      rateLimit.handle({ max: 20, windowMs: 60_000 }),
      idempotency.handle({ ttlSeconds: 30 }),
    ];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE] as string | undefined;

    if (!refreshToken) {
      throw new HttpException({ statusCode: 401, message: HttpMessages.Auth.MissingRefreshToken });
    }

    const result = await this.commandBus.dispatch<Either<InvalidTokenError, TokenPair>>(
      new RefreshTokenCommand({ refreshToken }),
    );

    if (result.isLeft()) {
      throw new HttpException({ statusCode: 401, message: HttpMessages.Auth.InvalidToken });
    }

    const pair = result.value;
    res.cookie(REFRESH_TOKEN_COOKIE, pair.refreshToken, refreshTokenCookieOptions);
    res.cookie(ACCESS_TOKEN_COOKIE, pair.accessToken, accessTokenCookieOptions);
    return res.status(200).json({ data: { authenticated: true } });
  }
}
