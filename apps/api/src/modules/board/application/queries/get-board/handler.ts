import { inject, injectable } from "tsyringe";

import { QueryHandler } from "@/core/queries/query-handler";
import { InjectionTokens } from "@/infra/container/tokens";
import { Board } from "@/modules/board/domain/entities/board";
import { Card } from "@/modules/board/domain/entities/card";
import { Column } from "@/modules/board/domain/entities/column";

import { BoardRepository } from "../../repositories/board.repository";
import { CardRepository } from "../../repositories/card.repository";
import { ColumnRepository } from "../../repositories/column.repository";

import { GetBoardQuery } from "./query";

export interface GetBoardResult {
  board: Board;
  columns: Column[];
  cards: Card[];
}

@injectable()
export class GetBoardHandler implements QueryHandler<GetBoardQuery, GetBoardResult | null> {
  public constructor(
    @inject(InjectionTokens.Repositories.Board)
    private readonly boardRepository: BoardRepository,
    @inject(InjectionTokens.Repositories.Column)
    private readonly columnRepository: ColumnRepository,
    @inject(InjectionTokens.Repositories.Card)
    private readonly cardRepository: CardRepository,
  ) {}

  // Returns the board with its columns and their cards in one response
  // (avoids an N+1 board → columns → cards client-side fetch pattern) —
  // see specs/001-board-card-module/research.md §5.
  public async execute(query: GetBoardQuery): Promise<GetBoardResult | null> {
    const board = await this.boardRepository.findById(query.boardId);

    if (!board) return null;

    const [columns, cards] = await Promise.all([
      this.columnRepository.findAllByBoardId(query.boardId),
      this.cardRepository.findAllByBoardId(query.boardId),
    ]);

    return { board, columns, cards };
  }
}
