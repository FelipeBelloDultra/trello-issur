import { faker } from "@faker-js/faker";
import supertest from "supertest";
import { container } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { App } from "@/infra/http/app";
import { WorkspaceMemberRepository } from "@/modules/workspace/application/repositories/workspace-member.repository";
import { CacheRepository } from "@/shared/cache/application/repositories/cache.repository";
import { makeAccount } from "@/test/factories/make-account";

describe("[E2E] - Board & Card module", () => {
  let app: App;
  let workspaceMemberRepository: WorkspaceMemberRepository;

  beforeAll(async () => {
    app = new App();
    await app.startServices();
    workspaceMemberRepository = container.resolve<WorkspaceMemberRepository>(
      InjectionTokens.Repositories.WorkspaceMember,
    );
  });

  afterAll(async () => {
    await app.stopServices();
  });

  // /auth/authenticate is rate-limited to 10 req/60s per IP+path (see
  // RateLimitMiddleware) — this file's specs each register several fresh
  // accounts, which would exhaust that budget across the whole suite run
  // if only reset once. Reset before every test instead.
  beforeEach(async () => {
    const cache = container.resolve<CacheRepository>(InjectionTokens.Cache.Repository);
    await cache.deleteByPrefix("rate-limit");
  });

  async function registerAndSignIn() {
    const password = "test-password";
    const account = makeAccount();
    await supertest(app.expressInstance)
      .post("/api/accounts")
      .send({ name: account.name, email: account.email, password });

    const agent = supertest.agent(app.expressInstance);
    await agent.post("/api/auth/authenticate").send({ email: account.email, password });

    const me = await agent.get("/api/auth/me");
    const meBody = me.body as { data: { id: string } };

    return { agent, accountId: meBody.data.id };
  }

  async function createWorkspaceWithBoard() {
    const owner = await registerAndSignIn();

    const workspaceRes = await owner.agent
      .post("/api/workspaces")
      .send({ name: faker.company.name() })
      .expect(201);
    const workspaceId = (workspaceRes.body as { data: { id: string } }).data.id;

    const boardRes = await owner.agent
      .post(`/api/workspaces/${workspaceId}/boards`)
      .send({ name: "Sprint 1" })
      .expect(201);
    const boardId = (boardRes.body as { data: { id: string } }).data.id;

    return { owner, workspaceId, boardId };
  }

  it("completes the full happy path: create board → column → card → move card (SC-001)", async () => {
    const { owner, workspaceId, boardId } = await createWorkspaceWithBoard();

    const columnA = await owner.agent
      .post(`/api/boards/${boardId}/columns`)
      .send({ name: "To Do" })
      .expect(201);
    const columnAId = (columnA.body as { data: { id: string } }).data.id;

    const columnB = await owner.agent
      .post(`/api/boards/${boardId}/columns`)
      .send({ name: "Done" })
      .expect(201);
    const columnBId = (columnB.body as { data: { id: string } }).data.id;

    const card = await owner.agent
      .post(`/api/columns/${columnAId}/cards`)
      .send({ title: "Write e2e test" })
      .expect(201);
    const cardId = (card.body as { data: { id: string } }).data.id;

    await owner.agent
      .patch(`/api/cards/${cardId}/move`)
      .send({ columnId: columnBId, position: 1 })
      .expect(200);

    const board = await owner.agent.get(`/api/boards/${boardId}`).expect(200);
    const boardBody = board.body as {
      data: { columns: Array<{ id: string; cards: Array<{ id: string }> }> };
    };
    const targetColumn = boardBody.data.columns.find((c) => c.id === columnBId);

    expect(targetColumn?.cards.map((c) => c.id)).toContain(cardId);

    // FR-011: list boards includes the created board
    const list = await owner.agent.get(`/api/workspaces/${workspaceId}/boards`).expect(200);
    const listBody = list.body as { data: Array<{ id: string }> };
    expect(listBody.data.map((b) => b.id)).toContain(boardId);

    // FR-014: rename board
    const renamed = await owner.agent
      .patch(`/api/boards/${boardId}`)
      .send({ name: "Sprint 1 (renamed)" })
      .expect(200);
    expect((renamed.body as { data: { name: string } }).data.name).toBe("Sprint 1 (renamed)");
  });

  it("rejects moving a card into a column of a different board (FR-007)", async () => {
    const { owner, workspaceId, boardId } = await createWorkspaceWithBoard();
    const column = await owner.agent
      .post(`/api/boards/${boardId}/columns`)
      .send({ name: "To Do" })
      .expect(201);
    const columnId = (column.body as { data: { id: string } }).data.id;
    const card = await owner.agent
      .post(`/api/columns/${columnId}/cards`)
      .send({ title: "Card" })
      .expect(201);
    const cardId = (card.body as { data: { id: string } }).data.id;

    // A second board in the same workspace, same owner — isolates the
    // assertion to the board boundary itself (FR-007), not workspace
    // membership (already covered by the non-member isolation spec).
    const otherBoard = await owner.agent
      .post(`/api/workspaces/${workspaceId}/boards`)
      .send({ name: "Other board" })
      .expect(201);
    const otherBoardId = (otherBoard.body as { data: { id: string } }).data.id;
    const otherColumn = await owner.agent
      .post(`/api/boards/${otherBoardId}/columns`)
      .send({ name: "Other" })
      .expect(201);
    const otherColumnId = (otherColumn.body as { data: { id: string } }).data.id;

    await owner.agent
      .patch(`/api/cards/${cardId}/move`)
      .send({ columnId: otherColumnId, position: 1 })
      .expect(409);
  });

  it("keeps the card in a single valid position under two concurrent moves (SC-003)", async () => {
    const { owner, boardId } = await createWorkspaceWithBoard();
    const columnA = await owner.agent
      .post(`/api/boards/${boardId}/columns`)
      .send({ name: "A" })
      .expect(201);
    const columnB = await owner.agent
      .post(`/api/boards/${boardId}/columns`)
      .send({ name: "B" })
      .expect(201);
    const columnAId = (columnA.body as { data: { id: string } }).data.id;
    const columnBId = (columnB.body as { data: { id: string } }).data.id;
    const card = await owner.agent
      .post(`/api/columns/${columnAId}/cards`)
      .send({ title: "Racing card" })
      .expect(201);
    const cardId = (card.body as { data: { id: string } }).data.id;

    const [first, second] = await Promise.all([
      owner.agent.patch(`/api/cards/${cardId}/move`).send({ columnId: columnBId, position: 1 }),
      owner.agent.patch(`/api/cards/${cardId}/move`).send({ columnId: columnAId, position: 2 }),
    ]);

    expect([first.status, second.status]).toEqual([200, 200]);

    const board = await owner.agent.get(`/api/boards/${boardId}`).expect(200);
    const boardBody = board.body as {
      data: { columns: Array<{ id: string; cards: Array<{ id: string }> }> };
    };
    const columnsContainingCard = boardBody.data.columns.filter((c) =>
      c.cards.some((cd) => cd.id === cardId),
    );

    // Never lost, never duplicated across two columns at once.
    expect(columnsContainingCard).toHaveLength(1);
  });

  it("cascades delete: removing a board removes its columns and cards (FR-010)", async () => {
    const { owner, boardId } = await createWorkspaceWithBoard();
    const column = await owner.agent
      .post(`/api/boards/${boardId}/columns`)
      .send({ name: "To Do" })
      .expect(201);
    const columnId = (column.body as { data: { id: string } }).data.id;
    await owner.agent.post(`/api/columns/${columnId}/cards`).send({ title: "Card" }).expect(201);

    await owner.agent.delete(`/api/boards/${boardId}`).expect(204);

    await owner.agent.get(`/api/boards/${boardId}`).expect(404);
  });

  it("deletes a column along with its cards without deleting the board (FR-012)", async () => {
    const { owner, boardId } = await createWorkspaceWithBoard();
    const column = await owner.agent
      .post(`/api/boards/${boardId}/columns`)
      .send({ name: "To Do" })
      .expect(201);
    const columnId = (column.body as { data: { id: string } }).data.id;
    await owner.agent.post(`/api/columns/${columnId}/cards`).send({ title: "Card" }).expect(201);

    await owner.agent.delete(`/api/columns/${columnId}`).expect(204);

    const board = await owner.agent.get(`/api/boards/${boardId}`).expect(200);
    const boardBody = board.body as { data: { columns: unknown[] } };
    expect(boardBody.data.columns).toHaveLength(0);
  });

  it("deletes a card individually without touching its board or column (FR-013)", async () => {
    const { owner, boardId } = await createWorkspaceWithBoard();
    const column = await owner.agent
      .post(`/api/boards/${boardId}/columns`)
      .send({ name: "To Do" })
      .expect(201);
    const columnId = (column.body as { data: { id: string } }).data.id;
    const card = await owner.agent
      .post(`/api/columns/${columnId}/cards`)
      .send({ title: "Card" })
      .expect(201);
    const cardId = (card.body as { data: { id: string } }).data.id;

    await owner.agent.delete(`/api/cards/${cardId}`).expect(204);

    const board = await owner.agent.get(`/api/boards/${boardId}`).expect(200);
    const boardBody = board.body as { data: { columns: Array<{ cards: unknown[] }> } };
    expect(boardBody.data.columns[0]?.cards).toHaveLength(0);
  });

  it("assigns a card only to a workspace member (FR-009)", async () => {
    const { owner, workspaceId, boardId } = await createWorkspaceWithBoard();
    const column = await owner.agent
      .post(`/api/boards/${boardId}/columns`)
      .send({ name: "To Do" })
      .expect(201);
    const columnId = (column.body as { data: { id: string } }).data.id;
    const card = await owner.agent
      .post(`/api/columns/${columnId}/cards`)
      .send({ title: "Card" })
      .expect(201);
    const cardId = (card.body as { data: { id: string } }).data.id;

    const outsider = await registerAndSignIn();

    await owner.agent
      .patch(`/api/cards/${cardId}/assign`)
      .send({ assigneeAccountId: outsider.accountId })
      .expect(409);

    await workspaceMemberRepository.create({
      workspaceId,
      accountId: outsider.accountId,
      role: "member",
    });

    await owner.agent
      .patch(`/api/cards/${cardId}/assign`)
      .send({ assigneeAccountId: outsider.accountId })
      .expect(200);
  });

  describe("non-member isolation (FR-002, SC-002)", () => {
    it("blocks a non-member from every board/column/card operation", async () => {
      const { boardId } = await createWorkspaceWithBoard();
      const outsider = await registerAndSignIn();

      await outsider.agent.get(`/api/boards/${boardId}`).expect(404);
      await outsider.agent.patch(`/api/boards/${boardId}`).send({ name: "x" }).expect(404);
      await outsider.agent.delete(`/api/boards/${boardId}`).expect(404);
      await outsider.agent
        .post(`/api/boards/${boardId}/columns`)
        .send({ name: "x" })
        .expect(404);
    });
  });

  describe("RBAC permission enforcement (SC-004)", () => {
    it("blocks a member (no board:delete/card:delete grant) from deleting a board or card", async () => {
      const { owner, workspaceId, boardId } = await createWorkspaceWithBoard();
      const column = await owner.agent
        .post(`/api/boards/${boardId}/columns`)
        .send({ name: "To Do" })
        .expect(201);
      const columnId = (column.body as { data: { id: string } }).data.id;
      const card = await owner.agent
        .post(`/api/columns/${columnId}/cards`)
        .send({ title: "Card" })
        .expect(201);
      const cardId = (card.body as { data: { id: string } }).data.id;

      const member = await registerAndSignIn();
      await workspaceMemberRepository.create({
        workspaceId,
        accountId: member.accountId,
        role: "member",
      });

      await member.agent.delete(`/api/boards/${boardId}`).expect(403);
      await member.agent.delete(`/api/cards/${cardId}`).expect(403);
    });

    it("blocks a viewer (no grants) from every write route", async () => {
      const { owner, workspaceId, boardId } = await createWorkspaceWithBoard();
      const viewer = await registerAndSignIn();
      await workspaceMemberRepository.create({
        workspaceId,
        accountId: viewer.accountId,
        role: "viewer",
      });

      await viewer.agent
        .post(`/api/boards/${boardId}/columns`)
        .send({ name: "x" })
        .expect(403);
      await viewer.agent.patch(`/api/boards/${boardId}`).send({ name: "x" }).expect(403);

      // A viewer can still read (no dedicated board:view permission key —
      // membership alone gates reads, per spec.md's Clarifications).
      await owner.agent.get(`/api/boards/${boardId}`).expect(200);
      await viewer.agent.get(`/api/boards/${boardId}`).expect(200);
    });
  });
});
