import { inject, injectable } from "tsyringe";

import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";

import { LogoutInput } from "../dtos/logout.dto";
import { InvalidTokenError } from "../errors/invalid-token.error";
import { CryptographGateway } from "../gateways/cryptograph.gateway";
import { TokenRepository } from "../repositories/token-repository";

type OnError = InvalidTokenError;
type OnSuccess = void;
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class LogoutUseCase {
  public constructor(
    @inject(InjectionTokens.Gateways.Cryptograph)
    private readonly cryptographGateway: CryptographGateway,
    @inject(InjectionTokens.Repositories.Token)
    private readonly tokenRepository: TokenRepository,
  ) {}

  public async execute(input: LogoutInput): Output {
    const claims = await this.cryptographGateway.verify(input.refreshToken);

    if (!claims) return left(new InvalidTokenError());

    await this.tokenRepository.delete(claims.sub);

    return right(undefined);
  }
}
