import { Request, Response } from "express";

import { TokenClaims } from "@/modules/auth/domain/value-objects/token-claims";
import { InMemoryAccountRoleRepository } from "@/test/repositories/in-memory-account-role.repository";

import { ValidateWorkspaceMiddleware } from "./validate-workspace.middleware";

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

describe("ValidateWorkspaceMiddleware", () => {
  let accountRoleRepository: InMemoryAccountRoleRepository;
  let sut: ValidateWorkspaceMiddleware;

  beforeEach(() => {
    accountRoleRepository = new InMemoryAccountRoleRepository();
    sut = new ValidateWorkspaceMiddleware(accountRoleRepository);
  });

  it("calls next when the account is a member of the workspace", async () => {
    const claims = makeClaims();
    accountRoleRepository.seed(claims.sub, WORKSPACE_ID, []);
    const next = vi.fn();

    await sut.handle()(makeReq({ account: claims }), {} as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it("throws 404 when the account is not a member of the workspace", async () => {
    const handler = sut.handle()(makeReq(), {} as Response, vi.fn());

    await expect(handler).rejects.toMatchObject({ statusCode: 404 });
  });

  it("throws 404 when workspaceId is missing from route params", async () => {
    const handler = sut.handle()(makeReq({ workspaceId: "" }), {} as Response, vi.fn());

    await expect(handler).rejects.toMatchObject({ statusCode: 404 });
  });

  it("throws 401 when req.account is not set", async () => {
    const handler = sut.handle()(makeReq({ account: undefined }), {} as Response, vi.fn());

    await expect(handler).rejects.toMatchObject({ statusCode: 401 });
  });
});
