import { faker } from "@faker-js/faker";

import { makeAccount } from "@/test/factories/make-account";
import { InMemoryCryptographGateway } from "@/test/gateways/in-memory-cryptograph.gateway";
import { InMemoryPasswordHasherGateway } from "@/test/gateways/in-memory-password-hasher.gateway";
import { InMemoryAccessTokenRepository } from "@/test/repositories/in-memory-access-token.repository";
import { InMemoryAccountRepository } from "@/test/repositories/in-memory-account.repository";
import { InMemoryTokenRepository } from "@/test/repositories/in-memory-token.repository";

import { InvalidCredentialsError } from "../../errors/invalid-credentials.error";

import { AuthenticateCommand } from "./command";
import { AuthenticateHandler } from "./handler";

function makeInput(overrides?: Partial<{ email: string; password: string }>) {
  return {
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
    ...overrides,
  };
}

describe("AuthenticateHandler", () => {
  let accountRepository: InMemoryAccountRepository;
  let tokenRepository: InMemoryTokenRepository;
  let accessTokenRepository: InMemoryAccessTokenRepository;
  let cryptographGateway: InMemoryCryptographGateway;
  let passwordHasher: InMemoryPasswordHasherGateway;
  let sut: AuthenticateHandler;

  beforeEach(() => {
    accountRepository = new InMemoryAccountRepository();
    tokenRepository = new InMemoryTokenRepository();
    accessTokenRepository = new InMemoryAccessTokenRepository();
    cryptographGateway = new InMemoryCryptographGateway();
    passwordHasher = new InMemoryPasswordHasherGateway();
    sut = new AuthenticateHandler(
      accountRepository,
      cryptographGateway,
      passwordHasher,
      tokenRepository,
      accessTokenRepository,
    );
  });

  it("returns right and stores the refresh + access token on valid credentials", async () => {
    const plainPassword = faker.internet.password({ length: 12 });
    const account = makeAccount({ passwordHash: `hashed:${plainPassword}` });
    accountRepository.items.push(account);

    const result = await sut.execute(
      new AuthenticateCommand({ email: account.email, password: plainPassword }),
    );

    expect(result.isRight()).toBe(true);
    expect(tokenRepository.items.has(account.id.toValue())).toBe(true);
    expect(accessTokenRepository.items.has(account.id.toValue())).toBe(true);
  });

  it("returns left with InvalidCredentialsError when account does not exist", async () => {
    const input = makeInput();

    const result = await sut.execute(
      new AuthenticateCommand({ email: input.email, password: input.password }),
    );

    expect(result.value).toBeInstanceOf(InvalidCredentialsError);
  });

  it("returns left with InvalidCredentialsError when password does not match", async () => {
    const account = makeAccount({ passwordHash: "hashed:correct-password" });
    accountRepository.items.push(account);

    const result = await sut.execute(
      new AuthenticateCommand({ email: account.email, password: "wrong-password" }),
    );

    expect(result.value).toBeInstanceOf(InvalidCredentialsError);
  });
});
