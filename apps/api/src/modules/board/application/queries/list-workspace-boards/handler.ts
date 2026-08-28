import { inject, injectable } from "tsyringe";

import { QueryHandler } from "@/core/queries/query-handler";
import { InjectionTokens } from "@/infra/container/tokens";
import { Board } from "@/modules/board/domain/entities/board";

import { BoardRepository } from "../../repositories/board.repository";

import { ListWorkspaceBoardsQuery } from "./query";

@injectable()
export class ListWorkspaceBoardsHandler implements QueryHandler<ListWorkspaceBoardsQuery, Board[]> {
  public constructor(
    @inject(InjectionTokens.Repositories.Board)
    private readonly boardRepository: BoardRepository,
  ) {}

  public async execute(query: ListWorkspaceBoardsQuery): Promise<Board[]> {
    return this.boardRepository.findAllByWorkspaceId(query.workspaceId);
  }
}
