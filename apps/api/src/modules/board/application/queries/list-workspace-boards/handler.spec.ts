import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { makeBoard } from "@/test/factories/make-board";
import { InMemoryBoardRepository } from "@/test/repositories/in-memory-board.repository";

import { ListWorkspaceBoardsHandler } from "./handler";
import { ListWorkspaceBoardsQuery } from "./query";

describe("ListWorkspaceBoardsHandler", () => {
  let boardRepository: InMemoryBoardRepository;
  let sut: ListWorkspaceBoardsHandler;

  beforeEach(() => {
    boardRepository = new InMemoryBoardRepository();
    sut = new ListWorkspaceBoardsHandler(boardRepository);
  });

  it("lists only boards belonging to the given workspace", async () => {
    const workspaceId = UniqueEntityID.create();
    boardRepository.items.push(makeBoard({ workspaceId }), makeBoard({ workspaceId }));
    boardRepository.items.push(makeBoard());

    const boards = await sut.execute(new ListWorkspaceBoardsQuery(workspaceId.toValue()));

    expect(boards).toHaveLength(2);
  });
});
