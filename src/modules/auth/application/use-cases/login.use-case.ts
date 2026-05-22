import { inject, injectable } from "tsyringe";

import { env } from "@/config/env";
import { Either, left, right } from "@/core/either";
import { parseDurationToSeconds } from "@/core/utils/duration";
import { InjectionTokens } from "@/infra/container/tokens";
import { TokenClaims } from "@/modules/auth/domain/value-objects/token-claims";
import { TokenPair } from "@/modules/auth/domain/value-objects/token-pair";
import { UserRepository } from "@/modules/user/application/repositories/user-repository";

import { LoginInput } from "../dtos/login.dto";
import { InvalidCredentialsError } from "../errors/invalid-credentials.error";
import { CryptographGateway } from "../gateways/cryptograph.gateway";
import { TokenRepository } from "../repositories/token-repository";

type OnError = InvalidCredentialsError;
type OnSuccess = TokenPair;
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class LoginUseCase {
  public constructor(
    @inject(InjectionTokens.Repositories.User)
    private readonly userRepository: UserRepository,
    @inject(InjectionTokens.Gateways.Cryptograph)
    private readonly cryptographGateway: CryptographGateway,
    @inject(InjectionTokens.Repositories.Token)
    private readonly tokenRepository: TokenRepository,
  ) {}

  public async execute(input: LoginInput): Output {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) return left(new InvalidCredentialsError());

    const valid = await user.password.compare(input.password);

    if (!valid) return left(new InvalidCredentialsError());

    const claims = TokenClaims.create(user.id.toValue(), user.email);
    const pair = await this.cryptographGateway.generatePair(claims);

    const ttl = parseDurationToSeconds(env.JWT_REFRESH_EXPIRES);
    await this.tokenRepository.save(user.id.toValue(), pair.refreshToken, ttl);

    return right(pair);
  }
}
