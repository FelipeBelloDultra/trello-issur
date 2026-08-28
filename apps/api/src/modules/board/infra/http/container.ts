import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { AssignCardController } from "./controllers/assign-card.controller";
import { CreateBoardController } from "./controllers/create-board.controller";
import { CreateCardController } from "./controllers/create-card.controller";
import { CreateColumnController } from "./controllers/create-column.controller";
import { DeleteBoardController } from "./controllers/delete-board.controller";
import { DeleteCardController } from "./controllers/delete-card.controller";
import { DeleteColumnController } from "./controllers/delete-column.controller";
import { GetBoardController } from "./controllers/get-board.controller";
import { ListWorkspaceBoardsController } from "./controllers/list-workspace-boards.controller";
import { MoveCardController } from "./controllers/move-card.controller";
import { MoveColumnController } from "./controllers/move-column.controller";
import { RenameBoardController } from "./controllers/rename-board.controller";
import { UpdateCardController } from "./controllers/update-card.controller";
import { ResolveBoardWorkspaceMiddleware } from "./middlewares/resolve-board-workspace.middleware";

export function setupHTTPBoardContainer(): void {
  container.register(
    InjectionTokens.Middlewares.ResolveBoardWorkspace,
    { useClass: ResolveBoardWorkspaceMiddleware },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<CreateBoardController>(
    InjectionTokens.Controllers.CreateBoard,
    { useClass: CreateBoardController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<RenameBoardController>(
    InjectionTokens.Controllers.RenameBoard,
    { useClass: RenameBoardController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<DeleteBoardController>(
    InjectionTokens.Controllers.DeleteBoard,
    { useClass: DeleteBoardController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<ListWorkspaceBoardsController>(
    InjectionTokens.Controllers.ListWorkspaceBoards,
    { useClass: ListWorkspaceBoardsController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<GetBoardController>(
    InjectionTokens.Controllers.GetBoard,
    { useClass: GetBoardController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<CreateColumnController>(
    InjectionTokens.Controllers.CreateColumn,
    { useClass: CreateColumnController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<MoveColumnController>(
    InjectionTokens.Controllers.MoveColumn,
    { useClass: MoveColumnController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<DeleteColumnController>(
    InjectionTokens.Controllers.DeleteColumn,
    { useClass: DeleteColumnController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<CreateCardController>(
    InjectionTokens.Controllers.CreateCard,
    { useClass: CreateCardController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<UpdateCardController>(
    InjectionTokens.Controllers.UpdateCard,
    { useClass: UpdateCardController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<MoveCardController>(
    InjectionTokens.Controllers.MoveCard,
    { useClass: MoveCardController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<AssignCardController>(
    InjectionTokens.Controllers.AssignCard,
    { useClass: AssignCardController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<DeleteCardController>(
    InjectionTokens.Controllers.DeleteCard,
    { useClass: DeleteCardController },
    { lifecycle: Lifecycle.Singleton },
  );
}
