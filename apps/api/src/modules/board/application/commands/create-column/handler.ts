import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { InjectionTokens } from "@/infra/container/tokens";
import { Column } from "@/modules/board/domain/entities/column";
import { ColumnName } from "@/modules/board/domain/value-objects/column-name";
import { Position } from "@/modules/board/domain/value-objects/position";

import { ColumnRepository } from "../../repositories/column.repository";

import { CreateColumnCommand } from "./command";

type Output = Promise<{ column: Column }>;

@injectable()
export class CreateColumnHandler implements CommandHandler<
  CreateColumnCommand,
  { column: Column }
> {
  public constructor(
    @inject(InjectionTokens.Repositories.Column)
    private readonly columnRepository: ColumnRepository,
  ) {}

  public async execute(command: CreateColumnCommand): Output {
    const lastPosition = await this.columnRepository.findLastPositionByBoardId(
      command.props.boardId,
    );

    const column = Column.create({
      boardId: UniqueEntityID.create(command.props.boardId),
      name: ColumnName.create(command.props.name),
      position: Position.after(lastPosition !== null ? Position.restore(lastPosition) : null),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.columnRepository.create(column);

    return { column };
  }
}
