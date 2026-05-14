import { faker } from "@faker-js/faker";

import { InvalidTokenError } from "@/modules/auth/application/errors/invalid-token.error";
import { TokenClaims } from "@/modules/auth/domain/value-objects/token-claims";
import { InMemoryCryptographGateway } from "@/test/gateways/in-memory-cryptograph-gateway";
import { InMemoryTokenRepository } from "@/test/repositories/in-memory-token-repository";

import { LogoutUseCase } from "./logout.use-case";

describe("LogoutUseCase", () => {
  let sut: LogoutUseCase;
  let cryptographGateway: InMemoryCryptographGateway;
  let tokenRepository: InMemoryTokenRepository;

  beforeEach(() => {
    cryptographGateway = new InMemoryCryptographGateway();
    tokenRepository = new InMemoryTokenRepository();
    sut = new LogoutUseCase(cryptographGateway, tokenRepository);
  });

  it("should succeed and remove the refresh token from the repository", async () => {
    const claims = TokenClaims.create(faker.string.uuid(), faker.internet.email());
    const { refreshToken } = await cryptographGateway.generatePair(claims);
    await tokenRepository.save(claims.sub, refreshToken, 3600);

    const result = await sut.execute({ refreshToken });

    expect(result.isRight()).toBe(true);
    expect(await tokenRepository.find(claims.sub)).toBeNull();
  });

  it("should return InvalidTokenError when token signature is invalid", async () => {
    const result = await sut.execute({ refreshToken: "invalid-token" });

    expect(result.value).toBeInstanceOf(InvalidTokenError);
  });
});
