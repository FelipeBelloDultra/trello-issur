import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { makeBoard } from "@/test/factories/make-board";
import { makeCard } from "@/test/factories/make-card";
import { InMemoryAccountRoleRepository } from "@/test/repositories/in-memory-account-role.repository";
import { InMemoryBoardRepository } from "@/test/repositories/in-memory-board.repository";
import { InMemoryCardRepository } from "@/test/repositories/in-memory-card.repository";

import { AccountNotWorkspaceMemberError } from "../../errors/account-not-workspace-member.error";
import { CardNotFoundError } from "../../errors/card-not-found.error";

import { AssignCardCommand } from "./command";
import { AssignCardHandler } from "./handler";

describe("AssignCardHandler", () => {
  let cardRepository: InMemoryCardRepository;
  let boardRepository: InMemoryBoardRepository;
  let accountRoleRepository: InMemoryAccountRoleRepository;
  let sut: AssignCardHandler;

  beforeEach(() => {
    cardRepository = new InMemoryCardRepository();
    boardRepository = new InMemoryBoardRepository();
    accountRoleRepository = new InMemoryAccountRoleRepository();
    sut = new AssignCardHandler(cardRepository, boardRepository, accountRoleRepository);
  });

  it("assigns the card to an account that is a member of the board's workspace", async () => {
    const board = makeBoard();
    boardRepository.items.push(board);
    const card = makeCard({ boardId: board.id });
    cardRepository.items.push(card);
    const assigneeAccountId = UniqueEntityID.create().toValue();
    accountRoleRepository.seed(assigneeAccountId, board.workspaceId.toValue(), []);

    const result = await sut.execute(
      new AssignCardCommand({ cardId: card.id.toValue(), assigneeAccountId }),
    );

    expect(result.isRight()).toBe(true);
    expect(cardRepository.items[0].assigneeAccountId?.toValue()).toBe(assigneeAccountId);
  });

  it("rejects assigning to an account that is not a member of the board's workspace", async () => {
    const board = makeBoard();
    boardRepository.items.push(board);
    const card = makeCard({ boardId: board.id });
    cardRepository.items.push(card);

    const result = await sut.execute(
      new AssignCardCommand({
        cardId: card.id.toValue(),
        assigneeAccountId: UniqueEntityID.create().toValue(),
      }),
    );

    expect(result.value).toBeInstanceOf(AccountNotWorkspaceMemberError);
  });

  it("unassigns the card when assigneeAccountId is null", async () => {
    const board = makeBoard();
    boardRepository.items.push(board);
    const card = makeCard({ boardId: board.id, assigneeAccountId: UniqueEntityID.create() });
    cardRepository.items.push(card);

    const result = await sut.execute(
      new AssignCardCommand({ cardId: card.id.toValue(), assigneeAccountId: null }),
    );

    expect(result.isRight()).toBe(true);
    expect(cardRepository.items[0].assigneeAccountId).toBeNull();
  });

  it("returns CardNotFoundError when the card does not exist", async () => {
    const result = await sut.execute(
      new AssignCardCommand({
        cardId: UniqueEntityID.create().toValue(),
        assigneeAccountId: UniqueEntityID.create().toValue(),
      }),
    );

    expect(result.value).toBeInstanceOf(CardNotFoundError);
  });
});
