import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { InjectionTokens } from "@/infra/container/tokens";
import { Card } from "@/modules/board/domain/entities/card";
import { Position } from "@/modules/board/domain/value-objects/position";

import { CardNotFoundError } from "../../errors/card-not-found.error";
import { ColumnNotFoundError } from "../../errors/column-not-found.error";
import { ColumnNotInBoardError } from "../../errors/column-not-in-board.error";
import { CardRepository } from "../../repositories/card.repository";
import { ColumnRepository } from "../../repositories/column.repository";

import { MoveCardCommand } from "./command";

type OnError = CardNotFoundError | ColumnNotFoundError | ColumnNotInBoardError;
type OnSuccess = { card: Card };
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class MoveCardHandler implements CommandHandler<
  MoveCardCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.Card)
    private readonly cardRepository: CardRepository,
    @inject(InjectionTokens.Repositories.Column)
    private readonly columnRepository: ColumnRepository,
  ) {}

  public async execute(command: MoveCardCommand): Output {
    const card = await this.cardRepository.findById(command.props.cardId);

    if (!card) return left(new CardNotFoundError());

    const targetColumn = await this.columnRepository.findById(command.props.columnId);

    if (!targetColumn) return left(new ColumnNotFoundError());

    // FR-007: a card only moves between columns of its own board.
    if (!targetColumn.boardId.equals(card.boardId)) {
      return left(new ColumnNotInBoardError());
    }

    // Server resolves the fractional position from the client-supplied
    // index (research.md §6) — reads the destination list's *current*
    // neighbors at write time rather than trusting a client-computed
    // float, and keeps the ordering scheme a domain concern.
    const siblings = (await this.cardRepository.findAllByColumnId(command.props.columnId)).filter(
      (sibling) => !sibling.id.equals(card.id),
    );
    const before = siblings[command.props.index - 1] ?? null;
    const after = siblings[command.props.index] ?? null;

    card.moveTo(
      UniqueEntityID.create(command.props.columnId),
      Position.between(before?.position ?? null, after?.position ?? null),
    );

    // Plain, unconditional row UPDATE — no optimistic lock, no explicit row
    // lock. Two concurrent moves of the same card serialize at the storage
    // layer; whichever commits last wins, and the card is never left
    // duplicated across columns or lost (spec SC-003). See
    // specs/001-board-card-module/research.md §3 for why this is enough.
    await this.cardRepository.save(card);

    return right({ card });
  }
}
