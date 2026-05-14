import { Elysia } from "elysia";
import { inject, injectable } from "inversify";

import { TOKENS } from "@/infra/container/tokens";
import { HttpErrors } from "@/infra/http/http-errors";
import { LoginDto } from "@/modules/auth/application/dtos/login.dto";
import { InvalidCredentialsError } from "@/modules/auth/application/errors/invalid-credentials.error";
import { LoginUseCase } from "@/modules/auth/application/use-cases/login.use-case";

@injectable()
export class LoginController {
  private static readonly route = "/auth/login" as const;
  private static readonly body = LoginDto;

  public constructor(
    @inject(TOKENS.LoginUseCase)
    private readonly loginUseCase: LoginUseCase,
  ) {}

  public setup() {
    return new Elysia().post(
      LoginController.route,
      async ({ body, set }) => {
        const result = await this.loginUseCase.execute(body);

        if (result.isLeft()) {
          const error = result.value;

          if (error instanceof InvalidCredentialsError) {
            set.status = 401;
            return HttpErrors.unauthorized(error.message);
          }

          set.status = 500;
          return HttpErrors.internalServerError();
        }

        set.status = 200;
        const pair = result.value;
        return { accessToken: pair.accessToken, refreshToken: pair.refreshToken };
      },
      { body: LoginController.body },
    );
  }
}
