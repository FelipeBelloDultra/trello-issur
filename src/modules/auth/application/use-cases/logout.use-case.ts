import { inject, injectable } from "inversify";

import { Either, left, right } from "@/core/either";
import { TOKENS } from "@/infra/container/tokens";

import { LogoutInput } from "../dtos/logout.dto";
import { InvalidTokenError } from "../errors/invalid-token.error";
import { EncryptGateway } from "../gateways/encrypt.gateway";
import { TokenRepository } from "../repositories/token-repository";

type OnError = InvalidTokenError;
type OnSuccess = void;
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class LogoutUseCase {
  public constructor(
    @inject(TOKENS.EncryptGateway)
    private readonly encryptGateway: EncryptGateway,
    @inject(TOKENS.TokenRepository)
    private readonly tokenRepository: TokenRepository,
  ) {}

  public async execute(input: LogoutInput): Output {
    const claims = await this.encryptGateway.verifyRefreshToken(input.refreshToken);

    if (!claims) return left(new InvalidTokenError());

    await this.tokenRepository.delete(claims.sub);

    return right(undefined);
  }
}
