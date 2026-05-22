import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { Either } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/controller";
import { HttpException } from "@/infra/http/http-exception";
import { RateLimitMiddleware } from "@/infra/http/middlewares/rate-limit.middleware";
import { LoginCommand } from "@/modules/auth/application/commands/login/command";
import { LoginDto } from "@/modules/auth/application/dtos/login.dto";
import { InvalidCredentialsError } from "@/modules/auth/application/errors/invalid-credentials.error";
import { TokenPair } from "@/modules/auth/domain/value-objects/token-pair";

@injectable()
export class LoginController implements Controller {
  public readonly path = "/auth/login";
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
    const input = LoginDto.parse(req.body);
    const result = await this.commandBus.dispatch<Either<InvalidCredentialsError, TokenPair>>(
      new LoginCommand(input.email, input.password),
    );

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof InvalidCredentialsError) {
        throw new HttpException({ statusCode: 401, message: error.message });
      }

      throw new Error("Unexpected login error");
    }

    const pair = result.value;
    return res.status(200).json({ accessToken: pair.accessToken, refreshToken: pair.refreshToken });
  }
}
