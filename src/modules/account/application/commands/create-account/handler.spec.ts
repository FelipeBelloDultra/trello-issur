import { faker } from "@faker-js/faker";

import { makeAccount } from "@/test/factories/make-account";
import { InMemoryPasswordHasherGateway } from "@/test/gateways/in-memory-password-hasher-gateway";
import { InMemoryAccountRepository } from "@/test/repositories/in-memory-account-repository";

import { EmailAlreadyTakenError } from "../../errors/email-already-taken.error";

import { CreateAccountCommand } from "./command";
import { CreateAccountHandler } from "./handler";

function makeInput(overrides?: Partial<{ name: string; email: string; password: string }>) {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
    ...overrides,
  };
}

describe("CreateAccountHandler", () => {
  let accountRepository: InMemoryAccountRepository;
  let passwordHasher: InMemoryPasswordHasherGateway;
  let sut: CreateAccountHandler;

  beforeEach(() => {
    accountRepository = new InMemoryAccountRepository();
    passwordHasher = new InMemoryPasswordHasherGateway();
    sut = new CreateAccountHandler(accountRepository, passwordHasher);
  });

  it("creates and persists the account on success", async () => {
    const input = makeInput();

    const result = await sut.execute(
      new CreateAccountCommand(input.name, input.email, input.password),
    );

    expect(result.isRight()).toBe(true);
    expect(accountRepository.items).toHaveLength(1);
  });

  it("returns left with EmailAlreadyTakenError when the email is already registered", async () => {
    const email = faker.internet.email();
    accountRepository.items.push(makeAccount({ email }));

    const result = await sut.execute(
      new CreateAccountCommand(faker.person.fullName(), email, faker.internet.password()),
    );

    expect(result.value).toBeInstanceOf(EmailAlreadyTakenError);
  });

  it("does not persist a duplicate account", async () => {
    const email = faker.internet.email();
    accountRepository.items.push(makeAccount({ email }));

    await sut.execute(
      new CreateAccountCommand(faker.person.fullName(), email, faker.internet.password()),
    );

    expect(accountRepository.items).toHaveLength(1);
  });
});
