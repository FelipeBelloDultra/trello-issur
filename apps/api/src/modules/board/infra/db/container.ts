import { container } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { BoardRepository } from "@/modules/board/application/repositories/board.repository";
import { CardRepository } from "@/modules/board/application/repositories/card.repository";
import { ColumnRepository } from "@/modules/board/application/repositories/column.repository";

import { DrizzleBoardRepository } from "./repositories/drizzle-board.repository";
import { DrizzleCardRepository } from "./repositories/drizzle-card.repository";
import { DrizzleColumnRepository } from "./repositories/drizzle-column.repository";

export function setupDatabaseBoardContainer(): void {
  // Deliberately NOT Singleton — built against DrizzleExecutor, which a
  // UnitOfWork overrides per-transaction in a child container (see
  // apps/api/README.md's "DI registration gotcha" and the workspace
  // module's equivalent comment). DeleteBoardHandler/DeleteColumnHandler
  // route all three of these through the shared UnitOfWork.
  container.register<BoardRepository>(InjectionTokens.Repositories.Board, {
    useClass: DrizzleBoardRepository,
  });

  container.register<ColumnRepository>(InjectionTokens.Repositories.Column, {
    useClass: DrizzleColumnRepository,
  });

  container.register<CardRepository>(InjectionTokens.Repositories.Card, {
    useClass: DrizzleCardRepository,
  });
}
