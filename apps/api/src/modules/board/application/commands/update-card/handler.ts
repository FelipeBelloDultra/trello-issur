import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Card } from "@/modules/board/domain/entities/card";
import { CardTitle } from "@/modules/board/domain/value-objects/card-title";

import { CardNotFoundError } from "../../errors/card-not-found.error";
import { CardRepository } from "../../repositories/card.repository";

import { UpdateCardCommand } from "./command";

type OnError = CardNotFoundError;
type OnSuccess = { card: Card };
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class UpdateCardHandler implements CommandHandler<
  UpdateCardCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.Card)
    private readonly cardRepository: CardRepository,
  ) {}

  // Title/description only — position/column are never touched here
  // (spec FR-008).
  public async execute(command: UpdateCardCommand): Output {
    const card = await this.cardRepository.findById(command.props.cardId);

    if (!card) return left(new CardNotFoundError());

    card.updateDetails({
      title: command.props.title !== undefined ? CardTitle.create(command.props.title) : undefined,
      description: command.props.description,
    });

    await this.cardRepository.save(card);

    return right({ card });
  }
}
