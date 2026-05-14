import { faker } from "@faker-js/faker";

import { InvalidCredentialsError } from "@/modules/auth/application/errors/invalid-credentials.error";
import { Password } from "@/modules/user/domain/value-objects/password";
import { makeUser } from "@/test/factories/make-user";
import { InMemoryCryptographGateway } from "@/test/gateways/in-memory-cryptograph-gateway";
import { InMemoryTokenRepository } from "@/test/repositories/in-memory-token-repository";
import { InMemoryUserRepository } from "@/test/repositories/in-memory-user-repository";

import { LoginUseCase } from "./login.use-case";

const makeInput = (overrides?: Partial<{ email: string; password: string }>) => ({
  email: faker.internet.email(),
  password: faker.internet.password({ length: 8 }),
  ...overrides,
});

describe("LoginUseCase", () => {
  let sut: LoginUseCase;
  let userRepository: InMemoryUserRepository;
  let cryptographGateway: InMemoryCryptographGateway;
  let tokenRepository: InMemoryTokenRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    cryptographGateway = new InMemoryCryptographGateway();
    tokenRepository = new InMemoryTokenRepository();
    sut = new LoginUseCase(userRepository, cryptographGateway, tokenRepository);
  });

  it("should return a token pair on valid credentials", async () => {
    const plainPassword = "secret123";
    const user = makeUser({ password: await Password.create(plainPassword) });
    userRepository.items.push(user);

    const result = await sut.execute(makeInput({ email: user.email, password: plainPassword }));

    expect(result.isRight()).toBe(true);
  });

  it("should store the refresh token in the repository", async () => {
    const plainPassword = "secret123";
    const user = makeUser({ password: await Password.create(plainPassword) });
    userRepository.items.push(user);

    await sut.execute(makeInput({ email: user.email, password: plainPassword }));

    expect(tokenRepository.items.has(user.id.toValue())).toBe(true);
  });

  it("should return InvalidCredentialsError when email is not found", async () => {
    const result = await sut.execute(makeInput());

    expect(result.value).toBeInstanceOf(InvalidCredentialsError);
  });

  it("should return InvalidCredentialsError when password is wrong", async () => {
    const user = makeUser({ password: await Password.create("correct-password") });
    userRepository.items.push(user);

    const result = await sut.execute(makeInput({ email: user.email, password: "wrong-password" }));

    expect(result.value).toBeInstanceOf(InvalidCredentialsError);
  });
});
