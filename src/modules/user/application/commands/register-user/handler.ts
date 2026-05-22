import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { User } from "@/modules/user/domain/entities/user";
import { Password } from "@/modules/user/domain/value-objects/password";

import { EmailAlreadyTakenError } from "../../errors/email-already-taken.error";
import { UserRepository } from "../../repositories/user-repository";

import { RegisterUserCommand } from "./command";

type OnError = EmailAlreadyTakenError;
type OnSuccess = { user: User };
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class RegisterUserHandler implements CommandHandler<
  RegisterUserCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.User)
    private readonly userRepository: UserRepository,
  ) {}

  public async execute(command: RegisterUserCommand): Output {
    const existing = await this.userRepository.findByEmail(command.email);

    if (existing) {
      return left(new EmailAlreadyTakenError(command.email));
    }

    const password = await Password.create(command.password);

    const user = User.create({
      name: command.name,
      email: command.email,
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.userRepository.create(user);

    return right({ user });
  }
}
