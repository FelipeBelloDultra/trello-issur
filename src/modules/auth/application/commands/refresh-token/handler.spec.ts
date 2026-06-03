import { faker } from "@faker-js/faker";

import { TokenClaims } from "@/modules/auth/domain/value-objects/token-claims";
import { makeAccount } from "@/test/factories/make-account";
import { InMemoryCryptographGateway } from "@/test/gateways/in-memory-cryptograph.gateway";
import { InMemoryTokenRepository } from "@/test/repositories/in-memory-token.repository";

import { InvalidTokenError } from "../../errors/invalid-token.error";

import { RefreshTokenCommand } from "./command";
import { RefreshTokenHandler } from "./handler";

describe("RefreshTokenHandler", () => {
  let tokenRepository: InMemoryTokenRepository;
  let cryptographGateway: InMemoryCryptographGateway;
  let sut: RefreshTokenHandler;

  beforeEach(() => {
    tokenRepository = new InMemoryTokenRepository();
    cryptographGateway = new InMemoryCryptographGateway();
    sut = new RefreshTokenHandler(cryptographGateway, tokenRepository);
  });

  async function seedStoredToken(accountId: string, email: string) {
    const claims = TokenClaims.create(accountId, email);
    const pair = await cryptographGateway.generatePair(claims);
    await tokenRepository.save(accountId, pair.refreshToken, 3600);
    return pair;
  }

  it("returns right and rotates the stored refresh token on success", async () => {
    const account = makeAccount();
    const oldPair = await seedStoredToken(account.id.toValue(), account.email);

    const result = await sut.execute(new RefreshTokenCommand(oldPair.refreshToken));

    const stored = await tokenRepository.find(account.id.toValue());
    expect(result.isRight()).toBe(true);
    expect(stored).not.toBe(oldPair.refreshToken);
  });

  it("returns left with InvalidTokenError when the token is malformed", async () => {
    const result = await sut.execute(new RefreshTokenCommand(faker.string.alphanumeric(40)));

    expect(result.value).toBeInstanceOf(InvalidTokenError);
  });

  it("returns left with InvalidTokenError when the stored token does not match", async () => {
    const account = makeAccount();
    const claims = TokenClaims.create(account.id.toValue(), account.email);
    const pair = await cryptographGateway.generatePair(claims);
    const differentPair = await cryptographGateway.generatePair(claims);
    await tokenRepository.save(account.id.toValue(), differentPair.refreshToken, 3600);

    const result = await sut.execute(new RefreshTokenCommand(pair.refreshToken));

    expect(result.value).toBeInstanceOf(InvalidTokenError);
  });
});
