import { Elysia } from "elysia";
import { inject, injectable } from "inversify";

import { TOKENS } from "@/infra/container/tokens";
import { HttpErrors } from "@/infra/http/http-errors";
import { LogoutDto } from "@/modules/auth/application/dtos/logout.dto";
import { InvalidTokenError } from "@/modules/auth/application/errors/invalid-token.error";
import { LogoutUseCase } from "@/modules/auth/application/use-cases/logout.use-case";

@injectable()
export class LogoutController {
  private static readonly route = "/auth/logout" as const;
  private static readonly body = LogoutDto;

  public constructor(
    @inject(TOKENS.LogoutUseCase)
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  public setup() {
    return new Elysia().post(
      LogoutController.route,
      async ({ body, set }) => {
        const result = await this.logoutUseCase.execute(body);

        if (result.isLeft()) {
          const error = result.value;

          if (error instanceof InvalidTokenError) {
            set.status = 401;
            return HttpErrors.unauthorized(error.message);
          }

          set.status = 500;
          return HttpErrors.internalServerError();
        }

        set.status = 204;
        return;
      },
      { body: LogoutController.body },
    );
  }
}
