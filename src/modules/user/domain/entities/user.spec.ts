import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { makeUser } from "@/test/factories/make-user";

describe("User", () => {
  it("should consider two users with the same ID as equal", () => {
    const id = UniqueEntityID.create();
    const sut = makeUser({}, id);
    const otherUser = makeUser({}, id);

    expect(sut.equals(otherUser)).toBe(true);
  });

  it("should consider two users with different IDs as not equal", () => {
    const sut = makeUser();
    const otherUser = makeUser();

    expect(sut.equals(otherUser)).toBe(false);
  });
});
