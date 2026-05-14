import { TokenClaims } from "./token-claims";

describe("TokenClaims", () => {
  it("should expose sub and email", () => {
    const sut = TokenClaims.create("user-1", "user@example.com");

    expect(sut.sub).toBe("user-1");
    expect(sut.email).toBe("user@example.com");
  });

  it("should be equal to another instance with the same values", () => {
    const sut = TokenClaims.create("user-1", "user@example.com");
    const other = TokenClaims.create("user-1", "user@example.com");

    expect(sut.equals(other)).toBe(true);
  });

  it("should not be equal when sub differs", () => {
    const sut = TokenClaims.create("user-1", "user@example.com");
    const other = TokenClaims.create("user-2", "user@example.com");

    expect(sut.equals(other)).toBe(false);
  });

  it("should not be equal when email differs", () => {
    const sut = TokenClaims.create("user-1", "a@example.com");
    const other = TokenClaims.create("user-1", "b@example.com");

    expect(sut.equals(other)).toBe(false);
  });
});
