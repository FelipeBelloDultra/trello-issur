import { inject, injectable } from "inversify";

import { env } from "@/config/env";
import { Either, left, right } from "@/core/either";
import { parseDurationToSeconds } from "@/core/utils/duration";
import { TOKENS } from "@/infra/container/tokens";
import { TokenPair } from "@/modules/auth/domain/value-objects/token-pair";

import { RefreshTokenInput } from "../dtos/refresh-token.dto";
import { InvalidTokenError } from "../errors/invalid-token.error";
import { CryptographGateway } from "../gateways/cryptograph.gateway";
import { TokenRepository } from "../repositories/token-repository";

type OnError = InvalidTokenError;
type OnSuccess = TokenPair;
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class RefreshTokenUseCase {
  public constructor(
    @inject(TOKENS.CryptographGateway)
    private readonly cryptographGateway: CryptographGateway,
    @inject(TOKENS.TokenRepository)
    private readonly tokenRepository: TokenRepository,
  ) {}

  public async execute(input: RefreshTokenInput): Output {
    const claims = await this.cryptographGateway.verify(input.refreshToken);

    if (!claims) return left(new InvalidTokenError());

    const stored = await this.tokenRepository.find(claims.sub);

    if (stored !== input.refreshToken) return left(new InvalidTokenError());

    const pair = await this.cryptographGateway.generatePair(claims);

    const ttl = parseDurationToSeconds(env.JWT_REFRESH_EXPIRES);
    await this.tokenRepository.save(claims.sub, pair.refreshToken, ttl);

    return right(pair);
  }
}
