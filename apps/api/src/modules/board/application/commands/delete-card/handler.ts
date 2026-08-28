import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";

import { CardNotFoundError } from "../../errors/card-not-found.error";
import { CardRepository } from "../../repositories/card.repository";

import { DeleteCardCommand } from "./command";

type OnError = CardNotFoundError;
type OnSuccess = void;
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class DeleteCardHandler implements CommandHandler<
  DeleteCardCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.Card)
    private readonly cardRepository: CardRepository,
  ) {}

  public async execute(command: DeleteCardCommand): Output {
    const card = await this.cardRepository.findById(command.cardId);

    if (!card) return left(new CardNotFoundError());

    await this.cardRepository.delete(command.cardId);

    return right(undefined);
  }
}
