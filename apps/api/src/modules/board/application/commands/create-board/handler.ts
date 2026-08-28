import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { InjectionTokens } from "@/infra/container/tokens";
import { Board } from "@/modules/board/domain/entities/board";
import { BoardName } from "@/modules/board/domain/value-objects/board-name";

import { BoardRepository } from "../../repositories/board.repository";

import { CreateBoardCommand } from "./command";

type Output = Promise<{ board: Board }>;

@injectable()
export class CreateBoardHandler implements CommandHandler<CreateBoardCommand, { board: Board }> {
  public constructor(
    @inject(InjectionTokens.Repositories.Board)
    private readonly boardRepository: BoardRepository,
  ) {}

  public async execute(command: CreateBoardCommand): Output {
    const board = Board.create({
      workspaceId: UniqueEntityID.create(command.props.workspaceId),
      name: BoardName.create(command.props.name),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.boardRepository.create(board);

    return { board };
  }
}
