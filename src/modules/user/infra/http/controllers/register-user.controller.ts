import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { Either } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/controller";
import { HttpException } from "@/infra/http/http-exception";
import { RegisterUserCommand } from "@/modules/user/application/commands/register-user/command";
import { RegisterUserDto } from "@/modules/user/application/dtos/register-user.dto";
import { EmailAlreadyTakenError } from "@/modules/user/application/errors/email-already-taken.error";
import { User } from "@/modules/user/domain/entities/user";

import { UserPresenter } from "../../presenters/user.presenter";

@injectable()
export class RegisterUserController implements Controller {
  public readonly path = "/users";
  public readonly method: HttpMethod = "post";
  public readonly middlewares: RequestHandler[] = [];

  public constructor(
    @inject(InjectionTokens.Bus.Command)
    private readonly commandBus: CommandBus,
  ) {}

  public async handler(req: Request, res: Response): Promise<Response> {
    const dto = RegisterUserDto.create(req.body);
    const result = await this.commandBus.dispatch<Either<EmailAlreadyTakenError, { user: User }>>(
      new RegisterUserCommand(dto.name, dto.email, dto.password),
    );

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
