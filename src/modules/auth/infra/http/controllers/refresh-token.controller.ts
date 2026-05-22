import { Request, Response } from "express";
import { RequestHandler } from "express";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/controller";
import { HttpException } from "@/infra/http/http-exception";
import { RateLimitMiddleware } from "@/infra/http/middlewares/rate-limit.middleware";
import { RefreshTokenDto } from "@/modules/auth/application/dtos/refresh-token.dto";
import { InvalidTokenError } from "@/modules/auth/application/errors/invalid-token.error";
import { RefreshTokenUseCase } from "@/modules/auth/application/use-cases/refresh-token.use-case";

@injectable()
export class RefreshTokenController implements Controller {
  public readonly path = "/auth/refresh";
  public readonly method: HttpMethod = "post";
  public readonly middlewares: RequestHandler[];

  public constructor(
    @inject(InjectionTokens.UseCases.RefreshToken)
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @inject(InjectionTokens.Middlewares.RateLimit)
    private readonly rateLimit: RateLimitMiddleware,
  ) {
    this.middlewares = [rateLimit.handle({ max: 20, windowMs: 60_000 })];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const input = RefreshTokenDto.parse(req.body);
    const result = await this.refreshTokenUseCase.execute(input);

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof InvalidTokenError) {
        throw new HttpException({ statusCode: 401, message: error.message });
      }

      throw new Error("Unexpected refresh-token error");
    }

    const pair = result.value;
    return res.status(200).json({ accessToken: pair.accessToken, refreshToken: pair.refreshToken });
  }
}
