import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { Either } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { HttpMessages } from "@/infra/http/http-messages";
import { LogoutCommand } from "@/modules/auth/application/commands/logout/command";
import { InvalidTokenError } from "@/modules/auth/application/errors/invalid-token.error";

import { ACCESS_TOKEN_COOKIE, accessTokenCookieOptions } from "../access-token-cookie";
import { REFRESH_TOKEN_COOKIE, refreshTokenCookieOptions } from "../refresh-token-cookie";

@injectable()
export class LogoutController implements Controller {
  public readonly path = "/auth/logout";
  public readonly method: HttpMethod = "post";
  public readonly middlewares: RequestHandler[] = [];

  public constructor(
    @inject(InjectionTokens.Bus.Command)
    private readonly commandBus: CommandBus,
  ) {}

  public async handler(req: Request, res: Response): Promise<Response> {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE] as string | undefined;

    if (!refreshToken) {
      throw new HttpException({ statusCode: 401, message: HttpMessages.Auth.MissingRefreshToken });
    }

    const result = await this.commandBus.dispatch<Either<InvalidTokenError, void>>(
      new LogoutCommand({ refreshToken }),
    );

    if (result.isLeft()) {
      throw new HttpException({ statusCode: 401, message: HttpMessages.Auth.InvalidToken });
    }

    res.clearCookie(REFRESH_TOKEN_COOKIE, refreshTokenCookieOptions);
    res.clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieOptions);
    return res.status(204).send();
  }
}
