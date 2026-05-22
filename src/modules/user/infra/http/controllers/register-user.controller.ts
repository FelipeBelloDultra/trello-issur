import { Request, Response } from "express";
import { RequestHandler } from "express";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/controller";
import { HttpException } from "@/infra/http/http-exception";
import { RegisterUserDto } from "@/modules/user/application/dtos/register-user.dto";
import { EmailAlreadyTakenError } from "@/modules/user/application/errors/email-already-taken.error";
import { RegisterUserUseCase } from "@/modules/user/application/use-cases/register-user.use-case";

import { UserPresenter } from "../../presenters/user.presenter";

@injectable()
export class RegisterUserController implements Controller {
  public readonly path = "/users";
  public readonly method: HttpMethod = "post";
  public readonly middlewares: RequestHandler[] = [];

  public constructor(
    @inject(InjectionTokens.UseCases.RegisterUser)
    private readonly useCase: RegisterUserUseCase,
  ) {}

  public async handler(req: Request, res: Response): Promise<Response> {
    const dto = RegisterUserDto.create(req.body);
    const result = await this.useCase.execute(dto);

    if (result.isRight()) {
      return res.status(201).json({
        data: UserPresenter.toHTTP(result.value.user),
      });
    }

    switch (result.value.constructor) {
      case EmailAlreadyTakenError:
        throw new HttpException({
          message: "Email already used",
          statusCode: 409,
          errors: [{ message: "Email already used" }],
        });
      default:
        throw new Error();
    }
  }
}
