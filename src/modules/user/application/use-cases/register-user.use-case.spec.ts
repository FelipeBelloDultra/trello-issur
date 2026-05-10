import { faker } from "@faker-js/faker";

import { EmailAlreadyTakenError } from "@/modules/user/application/errors/email-already-taken.error";
import { makeUser } from "@/test/factories/make-user";
import { InMemoryUserRepository } from "@/test/repositories/in-memory-user-repository";

import { RegisterUserUseCase } from "./register-user.use-case";

const makeInput = (overrides?: Partial<{ name: string; email: string; password: string }>) => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: faker.internet.password({ length: 8 }),
  ...overrides,
});

describe("RegisterUserUseCase", () => {
  let sut: RegisterUserUseCase;
  let userRepository: InMemoryUserRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    sut = new RegisterUserUseCase(userRepository);
  });

  it("should register the user successfully", async () => {
    const result = await sut.execute(makeInput());

    expect(result.isRight()).toBe(true);
  });

  it("should persist the user in the repository", async () => {
    await sut.execute(makeInput());

    expect(userRepository.items).toHaveLength(1);
  });

  it("should return EmailAlreadyTakenError when email is already taken", async () => {
    const email = faker.internet.email();
    userRepository.items.push(makeUser({ email }));

    const result = await sut.execute(makeInput({ email }));

    expect(result.value).toBeInstanceOf(EmailAlreadyTakenError);
  });
});
