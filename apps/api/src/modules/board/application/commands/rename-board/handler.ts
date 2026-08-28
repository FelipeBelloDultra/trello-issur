import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Board } from "@/modules/board/domain/entities/board";
import { BoardName } from "@/modules/board/domain/value-objects/board-name";

import { BoardNotFoundError } from "../../errors/board-not-found.error";
import { BoardRepository } from "../../repositories/board.repository";

import { RenameBoardCommand } from "./command";

type OnError = BoardNotFoundError;
type OnSuccess = { board: Board };
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class RenameBoardHandler implements CommandHandler<
  RenameBoardCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.Board)
    private readonly boardRepository: BoardRepository,
  ) {}

  public async execute(command: RenameBoardCommand): Output {
    const board = await this.boardRepository.findById(command.props.boardId);

    if (!board) return left(new BoardNotFoundError());

    board.rename(BoardName.create(command.props.name));
    await this.boardRepository.save(board);

    return right({ board });
  }
}
