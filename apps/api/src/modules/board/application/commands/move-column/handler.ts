import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Column } from "@/modules/board/domain/entities/column";
import { ColumnName } from "@/modules/board/domain/value-objects/column-name";
import { Position } from "@/modules/board/domain/value-objects/position";

import { ColumnNotFoundError } from "../../errors/column-not-found.error";
import { ColumnRepository } from "../../repositories/column.repository";

import { MoveColumnCommand } from "./command";

type OnError = ColumnNotFoundError;
type OnSuccess = { column: Column };
type Output = Promise<Either<OnError, OnSuccess>>;

// Repositions a single column at a time — fractional positioning (see
// specs/001-board-card-module/research.md §4) makes this equivalent to a
// bulk reorder endpoint (repeated single moves achieve any final order)
// while matching how drag-and-drop UIs already operate.
@injectable()
export class MoveColumnHandler implements CommandHandler<
  MoveColumnCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.Column)
    private readonly columnRepository: ColumnRepository,
  ) {}

  public async execute(command: MoveColumnCommand): Output {
    const column = await this.columnRepository.findById(command.props.columnId);

    if (!column) return left(new ColumnNotFoundError());

    if (command.props.name !== undefined) {
      column.rename(ColumnName.create(command.props.name));
    }

    if (command.props.index !== undefined) {
      // Server resolves the fractional position from the client-supplied
      // index (research.md §6), same pattern as MoveCardHandler.
      const siblings = (
        await this.columnRepository.findAllByBoardId(column.boardId.toValue())
      ).filter((sibling) => !sibling.id.equals(column.id));
      const before = siblings[command.props.index - 1] ?? null;
      const after = siblings[command.props.index] ?? null;

      column.reposition(Position.between(before?.position ?? null, after?.position ?? null));
    }

    await this.columnRepository.save(column);

    return right({ column });
  }
}
