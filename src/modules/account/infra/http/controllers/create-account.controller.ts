import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { Either } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { CreateAccountCommand } from "@/modules/account/application/commands/create-account/command";
import { CreateAccountDto } from "@/modules/account/application/dtos/create-account.dto";
import { EmailAlreadyTakenError } from "@/modules/account/application/errors/email-already-taken.error";
import { Account } from "@/modules/account/domain/entities/account";

import { AccountPresenter } from "../../presenters/account.presenter";

@injectable()
export class CreateAccountController implements Controller {
  public readonly path = "/accounts";
  public readonly method: HttpMethod = "post";
  public readonly middlewares: RequestHandler[] = [];

  public constructor(
    @inject(InjectionTokens.Bus.Command)
    private readonly commandBus: CommandBus,
  ) {}

  public async handler(req: Request, res: Response): Promise<Response> {
    const dto = CreateAccountDto.create(req.body);
    const result = await this.commandBus.dispatch<
      Either<EmailAlreadyTakenError, { account: Account }>
    >(new CreateAccountCommand(dto.name, dto.email, dto.password));

    if (result.isRight()) {
      return res.status(201).json({
        data: AccountPresenter.toHTTP(result.value.account),
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
