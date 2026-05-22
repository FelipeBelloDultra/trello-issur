import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { Either } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/controller";
import { HttpException } from "@/infra/http/http-exception";
import { LogoutCommand } from "@/modules/auth/application/commands/logout/command";
import { LogoutDto } from "@/modules/auth/application/dtos/logout.dto";
import { InvalidTokenError } from "@/modules/auth/application/errors/invalid-token.error";

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
    const input = LogoutDto.parse(req.body);
    const result = await this.commandBus.dispatch<Either<InvalidTokenError, void>>(
      new LogoutCommand(input.refreshToken),
    );

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof InvalidTokenError) {
        throw new HttpException({ statusCode: 401, message: error.message });
      }

      throw new Error("Unexpected logout error");
    }

    return res.status(204).send();
  }
}
