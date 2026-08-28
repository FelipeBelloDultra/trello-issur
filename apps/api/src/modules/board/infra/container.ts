import { container, Lifecycle } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { QueryBus } from "@/core/queries/query-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { AssignCardCommand } from "@/modules/board/application/commands/assign-card/command";
import { AssignCardHandler } from "@/modules/board/application/commands/assign-card/handler";
import { CreateBoardCommand } from "@/modules/board/application/commands/create-board/command";
import { CreateBoardHandler } from "@/modules/board/application/commands/create-board/handler";
import { CreateCardCommand } from "@/modules/board/application/commands/create-card/command";
import { CreateCardHandler } from "@/modules/board/application/commands/create-card/handler";
import { CreateColumnCommand } from "@/modules/board/application/commands/create-column/command";
import { CreateColumnHandler } from "@/modules/board/application/commands/create-column/handler";
import { DeleteBoardCommand } from "@/modules/board/application/commands/delete-board/command";
import { DeleteBoardHandler } from "@/modules/board/application/commands/delete-board/handler";
import { DeleteCardCommand } from "@/modules/board/application/commands/delete-card/command";
import { DeleteCardHandler } from "@/modules/board/application/commands/delete-card/handler";
import { DeleteColumnCommand } from "@/modules/board/application/commands/delete-column/command";
import { DeleteColumnHandler } from "@/modules/board/application/commands/delete-column/handler";
import { MoveCardCommand } from "@/modules/board/application/commands/move-card/command";
import { MoveCardHandler } from "@/modules/board/application/commands/move-card/handler";
import { MoveColumnCommand } from "@/modules/board/application/commands/move-column/command";
import { MoveColumnHandler } from "@/modules/board/application/commands/move-column/handler";
import { RenameBoardCommand } from "@/modules/board/application/commands/rename-board/command";
import { RenameBoardHandler } from "@/modules/board/application/commands/rename-board/handler";
import { UpdateCardCommand } from "@/modules/board/application/commands/update-card/command";
import { UpdateCardHandler } from "@/modules/board/application/commands/update-card/handler";
import { GetBoardHandler } from "@/modules/board/application/queries/get-board/handler";
import { GetBoardQuery } from "@/modules/board/application/queries/get-board/query";
import { ListWorkspaceBoardsHandler } from "@/modules/board/application/queries/list-workspace-boards/handler";
import { ListWorkspaceBoardsQuery } from "@/modules/board/application/queries/list-workspace-boards/query";

import { setupDatabaseBoardContainer } from "./db/container";
import { setupHTTPBoardContainer } from "./http/container";

function registerBoardHandlers(): void {
  container.register<CreateBoardHandler>(
    InjectionTokens.Handlers.CreateBoard,
    { useClass: CreateBoardHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<RenameBoardHandler>(
    InjectionTokens.Handlers.RenameBoard,
    { useClass: RenameBoardHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<DeleteBoardHandler>(
    InjectionTokens.Handlers.DeleteBoard,
    { useClass: DeleteBoardHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<ListWorkspaceBoardsHandler>(
    InjectionTokens.Handlers.ListWorkspaceBoards,
    { useClass: ListWorkspaceBoardsHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<GetBoardHandler>(
    InjectionTokens.Handlers.GetBoard,
    { useClass: GetBoardHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<CreateColumnHandler>(
    InjectionTokens.Handlers.CreateColumn,
    { useClass: CreateColumnHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<MoveColumnHandler>(
    InjectionTokens.Handlers.MoveColumn,
    { useClass: MoveColumnHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<DeleteColumnHandler>(
    InjectionTokens.Handlers.DeleteColumn,
    { useClass: DeleteColumnHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<CreateCardHandler>(
    InjectionTokens.Handlers.CreateCard,
    { useClass: CreateCardHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<UpdateCardHandler>(
    InjectionTokens.Handlers.UpdateCard,
    { useClass: UpdateCardHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<MoveCardHandler>(
    InjectionTokens.Handlers.MoveCard,
    { useClass: MoveCardHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<AssignCardHandler>(
    InjectionTokens.Handlers.AssignCard,
    { useClass: AssignCardHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<DeleteCardHandler>(
    InjectionTokens.Handlers.DeleteCard,
    { useClass: DeleteCardHandler },
    { lifecycle: Lifecycle.Singleton },
  );
}

function wireBoardBuses(): void {
  const commandBus = container.resolve<CommandBus>(InjectionTokens.Bus.Command);

  commandBus.register(
    CreateBoardCommand,
    container.resolve<CreateBoardHandler>(InjectionTokens.Handlers.CreateBoard),
  );
  commandBus.register(
    RenameBoardCommand,
    container.resolve<RenameBoardHandler>(InjectionTokens.Handlers.RenameBoard),
  );
  commandBus.register(
    DeleteBoardCommand,
    container.resolve<DeleteBoardHandler>(InjectionTokens.Handlers.DeleteBoard),
  );
  commandBus.register(
    CreateColumnCommand,
    container.resolve<CreateColumnHandler>(InjectionTokens.Handlers.CreateColumn),
  );
  commandBus.register(
    MoveColumnCommand,
    container.resolve<MoveColumnHandler>(InjectionTokens.Handlers.MoveColumn),
  );
  commandBus.register(
    DeleteColumnCommand,
    container.resolve<DeleteColumnHandler>(InjectionTokens.Handlers.DeleteColumn),
  );
  commandBus.register(
    CreateCardCommand,
    container.resolve<CreateCardHandler>(InjectionTokens.Handlers.CreateCard),
  );
  commandBus.register(
    UpdateCardCommand,
    container.resolve<UpdateCardHandler>(InjectionTokens.Handlers.UpdateCard),
  );
  commandBus.register(
    MoveCardCommand,
    container.resolve<MoveCardHandler>(InjectionTokens.Handlers.MoveCard),
  );
  commandBus.register(
    AssignCardCommand,
    container.resolve<AssignCardHandler>(InjectionTokens.Handlers.AssignCard),
  );
  commandBus.register(
    DeleteCardCommand,
    container.resolve<DeleteCardHandler>(InjectionTokens.Handlers.DeleteCard),
  );

  const queryBus = container.resolve<QueryBus>(InjectionTokens.Bus.Query);

  queryBus.register(
    ListWorkspaceBoardsQuery,
    container.resolve<ListWorkspaceBoardsHandler>(InjectionTokens.Handlers.ListWorkspaceBoards),
  );
  queryBus.register(
    GetBoardQuery,
    container.resolve<GetBoardHandler>(InjectionTokens.Handlers.GetBoard),
  );
}

export function setupBoardModule(): void {
  setupDatabaseBoardContainer();

  registerBoardHandlers();
  wireBoardBuses();

  setupHTTPBoardContainer();
}
