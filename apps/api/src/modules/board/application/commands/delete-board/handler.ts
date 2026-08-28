import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { UnitOfWork } from "@/shared/database/application/repositories/unit-of-work";

import { BoardNotFoundError } from "../../errors/board-not-found.error";
import { BoardRepository } from "../../repositories/board.repository";
import { CardRepository } from "../../repositories/card.repository";
import { ColumnRepository } from "../../repositories/column.repository";

import { DeleteBoardCommand } from "./command";

type OnError = BoardNotFoundError;
type OnSuccess = void;
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class DeleteBoardHandler implements CommandHandler<
  DeleteBoardCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.Board)
    private readonly boardRepository: BoardRepository,
    @inject(InjectionTokens.Databases.UnitOfWork)
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public async execute(command: DeleteBoardCommand): Output {
    const board = await this.boardRepository.findById(command.boardId);

    if (!board) return left(new BoardNotFoundError());

    // Board + its columns + their cards deleted atomically (FR-010) — same
    // shared UnitOfWork used elsewhere in the codebase, not a DB-level
    // cascade (see specs/001-board-card-module/data-model.md →
    // Relationships). Cards first, then columns, then the board itself —
    // matches the FK "restrict" direction on both tables.
    await this.unitOfWork.execute(async (scope) => {
      const cards = scope.get<CardRepository>(InjectionTokens.Repositories.Card);
      const columns = scope.get<ColumnRepository>(InjectionTokens.Repositories.Column);
      const boards = scope.get<BoardRepository>(InjectionTokens.Repositories.Board);

      await cards.deleteAllByBoardId(command.boardId);
      await columns.deleteAllByBoardId(command.boardId);
      await boards.delete(command.boardId);
    });

    return right(undefined);
  }
}
