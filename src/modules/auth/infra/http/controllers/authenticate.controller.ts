import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { Either } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { HttpMessages } from "@/infra/http/http-messages";
import { RateLimitMiddleware } from "@/infra/http/middlewares/rate-limit.middleware";
import { AuthenticateCommand } from "@/modules/auth/application/commands/authenticate/command";
import { AuthenticateDto } from "@/modules/auth/application/dtos/authenticate.dto";
import { InvalidCredentialsError } from "@/modules/auth/application/errors/invalid-credentials.error";
import { TokenPair } from "@/modules/auth/domain/value-objects/token-pair";

import { REFRESH_TOKEN_COOKIE, refreshTokenCookieOptions } from "../refresh-token-cookie";

@injectable()
export class AuthenticateController implements Controller {
  public readonly path = "/auth/authenticate";
  public readonly method: HttpMethod = "post";
  public readonly middlewares: RequestHandler[];

  public constructor(
    @inject(InjectionTokens.Bus.Command)
    private readonly commandBus: CommandBus,
    @inject(InjectionTokens.Middlewares.RateLimit)
    private readonly rateLimit: RateLimitMiddleware,
  ) {
    this.middlewares = [rateLimit.handle({ max: 10, windowMs: 60_000 })];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const input = AuthenticateDto.parse(req.body);
    const result = await this.commandBus.dispatch<Either<InvalidCredentialsError, TokenPair>>(
      new AuthenticateCommand({ email: input.email, password: input.password }),
    );

    if (result.isLeft()) {
      throw new HttpException({ statusCode: 401, message: HttpMessages.Auth.InvalidCredentials });
    }

    const pair = result.value;
    res.cookie(REFRESH_TOKEN_COOKIE, pair.refreshToken, refreshTokenCookieOptions);
    return res.status(200).json({ data: { access_token: pair.accessToken } });
  }
}
