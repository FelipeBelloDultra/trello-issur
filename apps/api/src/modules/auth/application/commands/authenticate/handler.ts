import { inject, injectable } from "tsyringe";

import { env } from "@/config/env";
import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { parseDurationToSeconds } from "@/core/utils/duration";
import { InjectionTokens } from "@/infra/container/tokens";
import { PasswordHasherGateway } from "@/modules/account/application/gateways/password-hasher.gateway";
import { AccountRepository } from "@/modules/account/application/repositories/account.repository";
import { TokenClaims } from "@/modules/auth/domain/value-objects/token-claims";
import { TokenPair } from "@/modules/auth/domain/value-objects/token-pair";

import { InvalidCredentialsError } from "../../errors/invalid-credentials.error";
import { CryptographGateway } from "../../gateways/cryptograph.gateway";
import { AccessTokenRepository } from "../../repositories/access-token.repository";
import { TokenRepository } from "../../repositories/token.repository";

import { AuthenticateCommand } from "./command";

type OnError = InvalidCredentialsError;
type OnSuccess = TokenPair;
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class AuthenticateHandler implements CommandHandler<
  AuthenticateCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.Account)
    private readonly accountRepository: AccountRepository,
    @inject(InjectionTokens.Gateways.Cryptograph)
    private readonly cryptographGateway: CryptographGateway,
    @inject(InjectionTokens.Gateways.PasswordHasher)
    private readonly passwordHasher: PasswordHasherGateway,
    @inject(InjectionTokens.Repositories.Token)
    private readonly tokenRepository: TokenRepository,
    @inject(InjectionTokens.Repositories.AccessToken)
    private readonly accessTokenRepository: AccessTokenRepository,
  ) {}

  public async execute(command: AuthenticateCommand): Output {
    const account = await this.accountRepository.findByEmail(command.props.email);

    if (!account) return left(new InvalidCredentialsError());

    const valid = await this.passwordHasher.compare(command.props.password, account.passwordHash);

    if (!valid) return left(new InvalidCredentialsError());

    const claims = TokenClaims.create(account.id.toValue(), account.email);
    const pair = await this.cryptographGateway.generatePair(claims);

    await Promise.all([
      this.tokenRepository.save({
        accountId: account.id.toValue(),
        refreshToken: pair.refreshToken,
        ttlSeconds: parseDurationToSeconds(env.JWT_REFRESH_EXPIRES),
      }),
      this.accessTokenRepository.save({
        accountId: account.id.toValue(),
        accessToken: pair.accessToken,
        ttlSeconds: parseDurationToSeconds(env.JWT_ACCESS_EXPIRES),
      }),
    ]);

    return right(pair);
  }
}
