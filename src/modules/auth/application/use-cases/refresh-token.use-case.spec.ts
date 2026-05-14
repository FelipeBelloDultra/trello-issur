import { faker } from "@faker-js/faker";

import { InvalidTokenError } from "@/modules/auth/application/errors/invalid-token.error";
import { TokenClaims } from "@/modules/auth/domain/value-objects/token-claims";
import { InMemoryCryptographGateway } from "@/test/gateways/in-memory-cryptograph-gateway";
import { InMemoryTokenRepository } from "@/test/repositories/in-memory-token-repository";

import { RefreshTokenUseCase } from "./refresh-token.use-case";

const makeInput = (overrides?: Partial<{ refreshToken: string }>) => ({
  refreshToken: `refresh:${faker.string.uuid()}:${faker.internet.email()}:1`,
  ...overrides,
});

describe("RefreshTokenUseCase", () => {
  let sut: RefreshTokenUseCase;
  let cryptographGateway: InMemoryCryptographGateway;
  let tokenRepository: InMemoryTokenRepository;

  beforeEach(() => {
    cryptographGateway = new InMemoryCryptographGateway();
    tokenRepository = new InMemoryTokenRepository();
    sut = new RefreshTokenUseCase(cryptographGateway, tokenRepository);
  });

  it("should return a new token pair when the refresh token is valid and stored", async () => {
    const claims = TokenClaims.create(faker.string.uuid(), faker.internet.email());
    const { refreshToken } = await cryptographGateway.generatePair(claims);
    await tokenRepository.save(claims.sub, refreshToken, 3600);

    const result = await sut.execute({ refreshToken });

    expect(result.isRight()).toBe(true);
  });

  it("should rotate the stored refresh token on success", async () => {
    const claims = TokenClaims.create(faker.string.uuid(), faker.internet.email());
    const oldPair = await cryptographGateway.generatePair(claims);
    await tokenRepository.save(claims.sub, oldPair.refreshToken, 3600);

    await sut.execute({ refreshToken: oldPair.refreshToken });

    const stored = await tokenRepository.find(claims.sub);
    expect(stored).not.toBe(oldPair.refreshToken);
  });

  it("should return InvalidTokenError when token signature is invalid", async () => {
    const result = await sut.execute(makeInput({ refreshToken: "invalid-token" }));

    expect(result.value).toBeInstanceOf(InvalidTokenError);
  });

  it("should return InvalidTokenError when token is not stored", async () => {
    const claims = TokenClaims.create(faker.string.uuid(), faker.internet.email());
    const { refreshToken } = await cryptographGateway.generatePair(claims);

    const result = await sut.execute({ refreshToken });

    expect(result.value).toBeInstanceOf(InvalidTokenError);
  });
});
