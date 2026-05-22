import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { makeAccount } from "@/test/factories/make-account";

describe("Account", () => {
  it("should consider two accounts with the same ID as equal", () => {
    const id = UniqueEntityID.create();
    const sut = makeAccount({}, id);
    const otherAccount = makeAccount({}, id);

    expect(sut.equals(otherAccount)).toBe(true);
  });

  it("should consider two accounts with different IDs as not equal", () => {
    const sut = makeAccount();
    const otherAccount = makeAccount();

    expect(sut.equals(otherAccount)).toBe(false);
  });
});
