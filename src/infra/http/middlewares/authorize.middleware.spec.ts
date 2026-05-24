import { Request, Response } from "express";

import { TokenClaims } from "@/modules/auth/domain/value-objects/token-claims";
import { InMemoryAccountRoleRepository } from "@/test/repositories/in-memory-account-role-repository";

import { AuthorizeMiddleware } from "./authorize.middleware";

const WORKSPACE_ID = "workspace-abc";

function makeClaims(accountId = "account-123") {
  return TokenClaims.create(accountId, "user@test.com");
}

function makeReq(overrides?: { account?: TokenClaims; workspaceId?: string }): Request {
  return {
    account: overrides && "account" in overrides ? overrides.account : makeClaims(),
    params: { workspaceId: overrides?.workspaceId ?? WORKSPACE_ID },
  } as unknown as Request;
}

describe("AuthorizeMiddleware", () => {
  let accountRoleRepository: InMemoryAccountRoleRepository;
  let sut: AuthorizeMiddleware;

  beforeEach(() => {
    accountRoleRepository = new InMemoryAccountRoleRepository();
    sut = new AuthorizeMiddleware(accountRoleRepository);
  });

  it("calls next when the account has all required permissions", async () => {
    const claims = makeClaims();
    accountRoleRepository.seed(claims.sub, WORKSPACE_ID, ["board:create", "board:edit"]);
    const next = vi.fn();

    await sut.handle(["board:create"])(makeReq({ account: claims }), {} as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it("throws 403 when the account lacks a required permission", async () => {
    const claims = makeClaims();
    accountRoleRepository.seed(claims.sub, WORKSPACE_ID, ["board:create"]);

    const handler = sut.handle(["board:delete"])(
      makeReq({ account: claims }),
      {} as Response,
      vi.fn(),
    );

    await expect(handler).rejects.toMatchObject({ statusCode: 403 });
  });

  it("throws 403 when the account has no roles in the workspace", async () => {
    const handler = sut.handle(["board:create"])(makeReq(), {} as Response, vi.fn());

    await expect(handler).rejects.toMatchObject({ statusCode: 403 });
  });

  it("throws 401 when req.account is not set", async () => {
    const handler = sut.handle(["board:create"])(
      makeReq({ account: undefined }),
      {} as Response,
      vi.fn(),
    );

    await expect(handler).rejects.toMatchObject({ statusCode: 401 });
  });

  it("throws 403 when workspaceId is missing from route params", async () => {
    const handler = sut.handle(["board:create"])(
      makeReq({ workspaceId: "" }),
      {} as Response,
      vi.fn(),
    );

    await expect(handler).rejects.toMatchObject({ statusCode: 403 });
  });
});
