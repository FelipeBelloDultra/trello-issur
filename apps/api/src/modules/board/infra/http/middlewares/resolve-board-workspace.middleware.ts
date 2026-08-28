import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { Middleware } from "@/infra/http/contracts/middleware";
import { HttpException } from "@/infra/http/http-exception";
import { HttpMessages } from "@/infra/http/http-messages";
import { BoardRepository } from "@/modules/board/application/repositories/board.repository";
import { CardRepository } from "@/modules/board/application/repositories/card.repository";
import { ColumnRepository } from "@/modules/board/application/repositories/column.repository";

// Board/column/card routes don't carry `:workspaceId` in their path (e.g.
// `GET /boards/:boardId`, `PATCH /cards/:cardId`) — but the existing
// ValidateWorkspaceMiddleware/AuthorizeMiddleware both key off
// `req.params.workspaceId`. Rather than duplicate their membership/RBAC
// logic, this middleware resolves the owning board's workspace from
// whichever id is present on the route and writes it into
// `req.params.workspaceId`, so the standard middleware chain runs
// unchanged after it (see specs/001-board-card-module/plan.md — this
// resolver + the existing middlewares together implement "same pattern as
// workspace routes" for a resource one level removed from workspaceId).
@injectable()
export class ResolveBoardWorkspaceMiddleware implements Middleware {
  public constructor(
    @inject(InjectionTokens.Repositories.Board)
    private readonly boardRepository: BoardRepository,
    @inject(InjectionTokens.Repositories.Column)
    private readonly columnRepository: ColumnRepository,
    @inject(InjectionTokens.Repositories.Card)
    private readonly cardRepository: CardRepository,
  ) {}

  public handle() {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      const workspaceId = await this.resolveWorkspaceId(req);

      if (!workspaceId) {
        throw new HttpException({ statusCode: 404, message: HttpMessages.Board.NotFound });
      }

      req.params.workspaceId = workspaceId;
      next();
    };
  }

  private async resolveWorkspaceId(req: Request): Promise<string | null> {
    const boardId = await this.resolveBoardId(req);

    if (!boardId) return null;

    const board = await this.boardRepository.findById(boardId);
    return board ? board.workspaceId.toValue() : null;
  }

  private async resolveBoardId(req: Request): Promise<string | null> {
    const { boardId, columnId, cardId } = req.params;

    if (boardId && !Array.isArray(boardId)) return boardId;

    if (columnId && !Array.isArray(columnId)) {
      const column = await this.columnRepository.findById(columnId);
      return column ? column.boardId.toValue() : null;
    }

    if (cardId && !Array.isArray(cardId)) {
      const card = await this.cardRepository.findById(cardId);
      return card ? card.boardId.toValue() : null;
    }

    return null;
  }
}
