import { inject, injectable } from "tsyringe";

import { env } from "@/config/env";
import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { parseDurationToSeconds } from "@/core/utils/duration";
import { InjectionTokens } from "@/infra/container/tokens";
import { TokenPair } from "@/modules/auth/domain/value-objects/token-pair";

import { InvalidTokenError } from "../../errors/invalid-token.error";
import { CryptographGateway } from "../../gateways/cryptograph.gateway";
import { TokenRepository } from "../../repositories/token.repository";

import { RefreshTokenCommand } from "./command";

type OnError = InvalidTokenError;
type OnSuccess = TokenPair;
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class RefreshTokenHandler implements CommandHandler<
  RefreshTokenCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Gateways.Cryptograph)
    private readonly cryptographGateway: CryptographGateway,
    @inject(InjectionTokens.Repositories.Token)
    private readonly tokenRepository: TokenRepository,
  ) {}

  public async execute(command: RefreshTokenCommand): Output {
    const claims = await this.cryptographGateway.verify(command.refreshToken);

    if (!claims) return left(new InvalidTokenError());

    const stored = await this.tokenRepository.find(claims.sub);

    if (stored !== command.refreshToken) return left(new InvalidTokenError());

    const pair = await this.cryptographGateway.generatePair(claims);

    const ttl = parseDurationToSeconds(env.JWT_REFRESH_EXPIRES);
    await this.tokenRepository.save(claims.sub, pair.refreshToken, ttl);

    return right(pair);
  }
}
