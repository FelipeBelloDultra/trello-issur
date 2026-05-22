import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Account } from "@/modules/account/domain/entities/account";
import { Password } from "@/modules/account/domain/value-objects/password";

import { EmailAlreadyTakenError } from "../../errors/email-already-taken.error";
import { AccountRepository } from "../../repositories/account-repository";

import { CreateAccountCommand } from "./command";

type OnError = EmailAlreadyTakenError;
type OnSuccess = { account: Account };
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class CreateAccountHandler implements CommandHandler<
  CreateAccountCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.Account)
    private readonly accountRepository: AccountRepository,
  ) {}

  public async execute(command: CreateAccountCommand): Output {
    const existing = await this.accountRepository.findByEmail(command.email);

    if (existing) {
      return left(new EmailAlreadyTakenError(command.email));
    }

    const password = await Password.create(command.password);

    const account = Account.create({
      name: command.name,
      email: command.email,
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.accountRepository.create(account);

    return right({ account });
  }
}
