import { Password } from "./password";

describe("Password", () => {
  it("should hash the plain text on create", async () => {
    const sut = await Password.create("secret123");

    expect(sut.toString()).not.toBe("secret123");
  });

  it("should return true when comparing with the correct plain text", async () => {
    const sut = await Password.create("secret123");

    expect(await sut.compare("secret123")).toBe(true);
  });

  it("should return false when comparing with a wrong plain text", async () => {
    const sut = await Password.create("secret123");

    expect(await sut.compare("wrongpassword")).toBe(false);
  });

  it("should restore from an existing hash and compare correctly", async () => {
    const original = await Password.create("secret123");
    const sut = Password.restore(original.toString());

    expect(await sut.compare("secret123")).toBe(true);
  });
});
