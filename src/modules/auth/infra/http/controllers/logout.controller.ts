import { Request, Response } from "express";
import { RequestHandler } from "express";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/controller";
import { HttpException } from "@/infra/http/http-exception";
import { LogoutDto } from "@/modules/auth/application/dtos/logout.dto";
import { InvalidTokenError } from "@/modules/auth/application/errors/invalid-token.error";
import { LogoutUseCase } from "@/modules/auth/application/use-cases/logout.use-case";

@injectable()
export class LogoutController implements Controller {
  public readonly path = "/auth/logout";
  public readonly method: HttpMethod = "post";
  public readonly middlewares: RequestHandler[] = [];

  public constructor(
    @inject(InjectionTokens.UseCases.Logout)
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  public async handler(req: Request, res: Response): Promise<Response> {
    const input = LogoutDto.parse(req.body);
    const result = await this.logoutUseCase.execute(input);

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
