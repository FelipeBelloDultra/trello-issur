import { Elysia } from "elysia";
import { inject, injectable } from "inversify";

import { TOKENS } from "@/infra/container/tokens";
import { HttpErrors } from "@/infra/http/http-errors";
import { RegisterUserDto } from "@/modules/user/application/dtos/register-user.dto";
import { EmailAlreadyTakenError } from "@/modules/user/application/errors/email-already-taken.error";
import { RegisterUserUseCase } from "@/modules/user/application/use-cases/register-user.use-case";

import { UserPresenter } from "../presenters/user.presenter";

@injectable()
export class RegisterUserController {
  private static readonly route = "/users" as const;
  private static readonly body = RegisterUserDto;

  public constructor(
    @inject(TOKENS.RegisterUserUseCase)
    private readonly registerUser: RegisterUserUseCase,
  ) {}

  public setup() {
    return new Elysia().post(
      RegisterUserController.route,
      async ({ body, set }) => {
        const result = await this.registerUser.execute(body);

        if (result.isLeft()) {
          const error = result.value;

          if (error instanceof EmailAlreadyTakenError) {
            set.status = 409;
            return HttpErrors.emailAlreadyTaken(error.message);
          }

          set.status = 500;
          return HttpErrors.internalServerError();
        }

        set.status = 201;
        return UserPresenter.registerUserToHttp(result.value.user);
      },
      { body: RegisterUserController.body },
    );
  }
}
