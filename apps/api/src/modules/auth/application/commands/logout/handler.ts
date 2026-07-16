import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";

import { InvalidTokenError } from "../../errors/invalid-token.error";
import { CryptographGateway } from "../../gateways/cryptograph.gateway";
import { TokenRepository } from "../../repositories/token.repository";

import { LogoutCommand } from "./command";

type OnError = InvalidTokenError;
type OnSuccess = void;
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class LogoutHandler implements CommandHandler<LogoutCommand, Either<OnError, OnSuccess>> {
  public constructor(
    @inject(InjectionTokens.Gateways.Cryptograph)
    private readonly cryptographGateway: CryptographGateway,
    @inject(InjectionTokens.Repositories.Token)
    private readonly tokenRepository: TokenRepository,
  ) {}

  public async execute(command: LogoutCommand): Output {
    const claims = await this.cryptographGateway.verify(command.props.refreshToken);

    if (!claims) return left(new InvalidTokenError());

    await this.tokenRepository.delete(claims.sub);

    return right(undefined);
  }
}
