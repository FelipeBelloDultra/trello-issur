import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { UnitOfWork } from "@/shared/database/application/repositories/unit-of-work";

import { ColumnNotFoundError } from "../../errors/column-not-found.error";
import { CardRepository } from "../../repositories/card.repository";
import { ColumnRepository } from "../../repositories/column.repository";

import { DeleteColumnCommand } from "./command";

type OnError = ColumnNotFoundError;
type OnSuccess = void;
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class DeleteColumnHandler implements CommandHandler<
  DeleteColumnCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.Column)
    private readonly columnRepository: ColumnRepository,
    @inject(InjectionTokens.Databases.UnitOfWork)
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public async execute(command: DeleteColumnCommand): Output {
    const column = await this.columnRepository.findById(command.columnId);

    if (!column) return left(new ColumnNotFoundError());

    // Column + its cards deleted atomically (FR-012) — same UnitOfWork
    // used by DeleteBoardHandler, not a DB-level cascade (see
    // specs/001-board-card-module/data-model.md → Relationships).
    await this.unitOfWork.execute(async (scope) => {
      const cards = scope.get<CardRepository>(InjectionTokens.Repositories.Card);
      const columns = scope.get<ColumnRepository>(InjectionTokens.Repositories.Column);

      await cards.deleteAllByColumnId(command.columnId);
      await columns.delete(command.columnId);
    });

    return right(undefined);
  }
}
