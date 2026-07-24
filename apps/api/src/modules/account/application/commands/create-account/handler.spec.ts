import { faker } from "@faker-js/faker";

import { InjectionTokens } from "@/infra/container/tokens";
import { Email } from "@/modules/account/domain/value-objects/email";
import { QueueEvents } from "@/shared/queue/application/events";
import { makeAccount } from "@/test/factories/make-account";
import { InMemoryPasswordHasherGateway } from "@/test/gateways/in-memory-password-hasher.gateway";
import { InMemoryAccountRepository } from "@/test/repositories/in-memory-account.repository";
import { InMemoryOutboxRepository } from "@/test/repositories/in-memory-outbox.repository";
import { InMemoryUnitOfWork } from "@/test/repositories/in-memory-unit-of-work";

import { EmailAlreadyTakenError } from "../../errors/email-already-taken.error";

import { CreateAccountCommand } from "./command";
import { CreateAccountHandler } from "./handler";

function makeInput(
  overrides?: Partial<{ name: string; email: string; password: string; createWorkspace: boolean }>,
) {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
    createWorkspace: false,
    ...overrides,
  };
}

describe("CreateAccountHandler", () => {
  let accountRepository: InMemoryAccountRepository;
  let outboxRepository: InMemoryOutboxRepository;
  let passwordHasher: InMemoryPasswordHasherGateway;
  let unitOfWork: InMemoryUnitOfWork;
  let sut: CreateAccountHandler;

  beforeEach(() => {
    accountRepository = new InMemoryAccountRepository();
    outboxRepository = new InMemoryOutboxRepository();
    passwordHasher = new InMemoryPasswordHasherGateway();
    unitOfWork = new InMemoryUnitOfWork(
      new Map<symbol, unknown>([
        [InjectionTokens.Repositories.Account, accountRepository],
        [InjectionTokens.Queue.OutboxRepository, outboxRepository],
      ]),
    );
    sut = new CreateAccountHandler(accountRepository, passwordHasher, unitOfWork);
  });

  it("creates and persists the account and enqueues the created event on success", async () => {
    const input = makeInput();

    const result = await sut.execute(
      new CreateAccountCommand({ name: input.name, email: input.email, password: input.password }),
    );

    expect(result.isRight()).toBe(true);
    expect(accountRepository.items).toHaveLength(1);
    expect(outboxRepository.items).toHaveLength(1);
    expect(outboxRepository.items[0].routingKey).toBe(QueueEvents.Account.Created);
  });

  it("also enqueues the workspace personal creation event when createWorkspace is true", async () => {
    const input = makeInput({ createWorkspace: true });

    const result = await sut.execute(
      new CreateAccountCommand({
        name: input.name,
        email: input.email,
        password: input.password,
        createWorkspace: input.createWorkspace,
      }),
    );

    expect(result.isRight()).toBe(true);
    expect(outboxRepository.items).toHaveLength(2);
    expect(outboxRepository.items[1].routingKey).toBe(
      QueueEvents.Workspace.PersonalCreationRequested,
    );
  });

  it("returns left with EmailAlreadyTakenError when the email is already registered", async () => {
    const email = faker.internet.email();
    accountRepository.items.push(makeAccount({ email: Email.create(email) }));

    const result = await sut.execute(
      new CreateAccountCommand({
        name: faker.person.fullName(),
        email,
        password: faker.internet.password(),
      }),
    );

    expect(result.value).toBeInstanceOf(EmailAlreadyTakenError);
  });

  it("does not persist a duplicate account", async () => {
    const email = faker.internet.email();
    accountRepository.items.push(makeAccount({ email: Email.create(email) }));

    await sut.execute(
      new CreateAccountCommand({
        name: faker.person.fullName(),
        email,
        password: faker.internet.password(),
      }),
    );

    expect(accountRepository.items).toHaveLength(1);
  });
});
