import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { PasswordHasherGateway } from "@/modules/account/application/gateways/password-hasher.gateway";
import { Account } from "@/modules/account/domain/entities/account";
import { QueueEvents } from "@/shared/queue/application/events";
import { QueuePublisherGateway } from "@/shared/queue/application/gateways/queue-publisher.gateway";

import { EmailAlreadyTakenError } from "../../errors/email-already-taken.error";
import { AccountRepository } from "../../repositories/account.repository";

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
    @inject(InjectionTokens.Gateways.PasswordHasher)
    private readonly passwordHasher: PasswordHasherGateway,
    @inject(InjectionTokens.Queue.Publisher)
    private readonly publisher: QueuePublisherGateway,
  ) {}

  public async execute(command: CreateAccountCommand): Output {
    const existing = await this.accountRepository.findByEmail(command.props.email);

    if (existing) {
      return left(new EmailAlreadyTakenError(command.props.email));
    }

    const passwordHash = await this.passwordHasher.hash(command.props.password);

    const account = Account.create({
      name: command.props.name,
      email: command.props.email,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.accountRepository.create(account);

    this.publisher.publish(QueueEvents.Account.Created, {
      accountId: account.id.toValue(),
      name: account.name,
      email: account.email,
    });

    if (command.props.createWorkspace) {
      this.publisher.publish(QueueEvents.Workspace.PersonalCreationRequested, {
        accountId: account.id.toValue(),
        accountName: account.name,
      });
    }

    return right({ account });
  }
}
