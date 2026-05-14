import { Elysia } from "elysia";
import { inject, injectable } from "inversify";

import { TOKENS } from "@/infra/container/tokens";
import { HttpErrors } from "@/infra/http/http-errors";
import { RefreshTokenDto } from "@/modules/auth/application/dtos/refresh-token.dto";
import { InvalidTokenError } from "@/modules/auth/application/errors/invalid-token.error";
import { RefreshTokenUseCase } from "@/modules/auth/application/use-cases/refresh-token.use-case";

@injectable()
export class RefreshTokenController {
  private static readonly route = "/auth/refresh" as const;
  private static readonly body = RefreshTokenDto;

  public constructor(
    @inject(TOKENS.RefreshTokenUseCase)
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  public setup() {
    return new Elysia().post(
      RefreshTokenController.route,
      async ({ body, set }) => {
        const result = await this.refreshTokenUseCase.execute(body);

        if (result.isLeft()) {
          const error = result.value;

          if (error instanceof InvalidTokenError) {
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
      { body: RefreshTokenController.body },
    );
  }
}
