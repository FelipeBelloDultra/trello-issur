import { TokenPair } from "./token-pair";

describe("TokenPair", () => {
  it("should expose accessToken and refreshToken", () => {
    const sut = TokenPair.create("access-token", "refresh-token");

    expect(sut.accessToken).toBe("access-token");
    expect(sut.refreshToken).toBe("refresh-token");
  });

  it("should be equal to another instance with the same tokens", () => {
    const sut = TokenPair.create("access-token", "refresh-token");
    const other = TokenPair.create("access-token", "refresh-token");

    expect(sut.equals(other)).toBe(true);
  });

  it("should not be equal when accessToken differs", () => {
    const sut = TokenPair.create("access-a", "refresh-token");
    const other = TokenPair.create("access-b", "refresh-token");

    expect(sut.equals(other)).toBe(false);
  });

  it("should not be equal when refreshToken differs", () => {
    const sut = TokenPair.create("access-token", "refresh-a");
    const other = TokenPair.create("access-token", "refresh-b");

    expect(sut.equals(other)).toBe(false);
  });
});
