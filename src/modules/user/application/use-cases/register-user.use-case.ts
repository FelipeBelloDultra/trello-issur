import { Either, left, right } from "@/core/either";
import { User } from "@/modules/user/domain/entities/user";
import { Password } from "@/modules/user/domain/value-objects/password";

import { RegisterUserInput } from "../dtos/register-user.dto";
import { EmailAlreadyTakenError } from "../errors/email-already-taken.error";
import { UserRepository } from "../repositories/user-repository";

type OnError = EmailAlreadyTakenError;
type OnSuccess = { user: User };
type Output = Promise<Either<OnError, OnSuccess>>;

export class RegisterUserUseCase {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute(input: RegisterUserInput): Output {
    const existing = await this.userRepository.findByEmail(input.email);

    if (existing) {
      return left(new EmailAlreadyTakenError(input.email));
    }

    const password = await Password.create(input.password);

    const user = User.create({
      name: input.name,
      email: input.email,
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.userRepository.create(user);

    return right({ user });
  }
}
