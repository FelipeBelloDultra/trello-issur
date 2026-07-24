import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { PasswordHasherGateway } from "@/modules/account/application/gateways/password-hasher.gateway";
import { Account } from "@/modules/account/domain/entities/account";
import { AccountName } from "@/modules/account/domain/value-objects/account-name";
import { Email } from "@/modules/account/domain/value-objects/email";
import { UnitOfWork } from "@/shared/database/application/repositories/unit-of-work";
import { QueueEvents } from "@/shared/queue/application/events";
import { OutboxRepository } from "@/shared/queue/application/repositories/outbox.repository";

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
    @inject(InjectionTokens.Databases.UnitOfWork)
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public async execute(command: CreateAccountCommand): Output {
    const existing = await this.accountRepository.findByEmail(command.props.email);

    if (existing) {
      return left(new EmailAlreadyTakenError(command.props.email));
    }

    const passwordHash = await this.passwordHasher.hash(command.props.password);

    const account = Account.create({
      name: AccountName.create(command.props.name),
      email: Email.create(command.props.email),
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Account + its own domain events land in one transaction — the outbox
    // relay publishes them afterward, so a crash right after commit can
    // delay the event but never lose it silently (see OutboxRelay).
    await this.unitOfWork.execute(async (scope) => {
      const accounts = scope.get<AccountRepository>(InjectionTokens.Repositories.Account);
      const outbox = scope.get<OutboxRepository>(InjectionTokens.Queue.OutboxRepository);

      await accounts.create(account);

      await outbox.save({
        routingKey: QueueEvents.Account.Created,
        payload: { accountId: account.id.toValue(), name: account.name, email: account.email },
      });

      if (command.props.createWorkspace) {
        await outbox.save({
          routingKey: QueueEvents.Workspace.PersonalCreationRequested,
          payload: { accountId: account.id.toValue(), accountName: account.name },
        });
      }
    });

    return right({ account });
  }
}
