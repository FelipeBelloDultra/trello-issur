import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Card } from "@/modules/board/domain/entities/card";
import { CardTitle } from "@/modules/board/domain/value-objects/card-title";
import { Position } from "@/modules/board/domain/value-objects/position";

import { ColumnNotFoundError } from "../../errors/column-not-found.error";
import { CardRepository } from "../../repositories/card.repository";
import { ColumnRepository } from "../../repositories/column.repository";

import { CreateCardCommand } from "./command";

type OnError = ColumnNotFoundError;
type OnSuccess = { card: Card };
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class CreateCardHandler implements CommandHandler<
  CreateCardCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.Column)
    private readonly columnRepository: ColumnRepository,
    @inject(InjectionTokens.Repositories.Card)
    private readonly cardRepository: CardRepository,
  ) {}

  public async execute(command: CreateCardCommand): Output {
    const column = await this.columnRepository.findById(command.props.columnId);

    if (!column) return left(new ColumnNotFoundError());

    const lastPosition = await this.cardRepository.findLastPositionByColumnId(
      command.props.columnId,
    );

    const card = Card.create({
      boardId: column.boardId,
      columnId: column.id,
      title: CardTitle.create(command.props.title),
      description: command.props.description ?? null,
      position: Position.after(lastPosition !== null ? Position.restore(lastPosition) : null),
      assigneeAccountId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.cardRepository.create(card);

    return right({ card });
  }
}
