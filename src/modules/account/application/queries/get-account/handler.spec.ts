import { makeAccount } from "@/test/factories/make-account";
import { InMemoryAccountRepository } from "@/test/repositories/in-memory-account.repository";

import { GetAccountHandler } from "./handler";
import { GetAccountQuery } from "./query";

describe("GetAccountHandler", () => {
  let accountRepository: InMemoryAccountRepository;
  let sut: GetAccountHandler;

  beforeEach(() => {
    accountRepository = new InMemoryAccountRepository();
    sut = new GetAccountHandler(accountRepository);
  });

  it("returns the account when it exists", async () => {
    const account = makeAccount();
    accountRepository.items.push(account);

    const result = await sut.execute(new GetAccountQuery(account.id.toValue()));

    expect(result).toBe(account);
  });

  it("returns null when the account does not exist", async () => {
    const result = await sut.execute(new GetAccountQuery("non-existent-id"));

    expect(result).toBeNull();
  });
});
