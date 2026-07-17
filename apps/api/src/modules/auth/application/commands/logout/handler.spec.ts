import { faker } from "@faker-js/faker";

import { TokenClaims } from "@/modules/auth/domain/value-objects/token-claims";
import { makeAccount } from "@/test/factories/make-account";
import { InMemoryCryptographGateway } from "@/test/gateways/in-memory-cryptograph.gateway";
import { InMemoryAccessTokenRepository } from "@/test/repositories/in-memory-access-token.repository";
import { InMemoryTokenRepository } from "@/test/repositories/in-memory-token.repository";

import { InvalidTokenError } from "../../errors/invalid-token.error";

import { LogoutCommand } from "./command";
import { LogoutHandler } from "./handler";

describe("LogoutHandler", () => {
  let tokenRepository: InMemoryTokenRepository;
  let accessTokenRepository: InMemoryAccessTokenRepository;
  let cryptographGateway: InMemoryCryptographGateway;
  let sut: LogoutHandler;

  beforeEach(() => {
    tokenRepository = new InMemoryTokenRepository();
    accessTokenRepository = new InMemoryAccessTokenRepository();
    cryptographGateway = new InMemoryCryptographGateway();
    sut = new LogoutHandler(cryptographGateway, tokenRepository, accessTokenRepository);
  });

  async function seedStoredToken(accountId: string, email: string) {
    const claims = TokenClaims.create(accountId, email);
    const pair = await cryptographGateway.generatePair(claims);
    await tokenRepository.save({ accountId, refreshToken: pair.refreshToken, ttlSeconds: 3600 });
    await accessTokenRepository.save({ accountId, accessToken: pair.accessToken, ttlSeconds: 900 });
    return pair;
  }

  it("returns right and removes the stored refresh + access token on success", async () => {
    const account = makeAccount();
    const pair = await seedStoredToken(account.id.toValue(), account.email);

    const result = await sut.execute(new LogoutCommand({ refreshToken: pair.refreshToken }));

    expect(result.isRight()).toBe(true);
    expect(tokenRepository.items.has(account.id.toValue())).toBe(false);
    expect(accessTokenRepository.items.has(account.id.toValue())).toBe(false);
  });

  it("returns left with InvalidTokenError when the token is malformed", async () => {
    const result = await sut.execute(
      new LogoutCommand({ refreshToken: faker.string.alphanumeric(40) }),
    );

    expect(result.value).toBeInstanceOf(InvalidTokenError);
  });
});
