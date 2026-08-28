import { BoardNameEmptyError } from "../errors/board-name-empty.error";

import { BoardName } from "./board-name";

describe("BoardName", () => {
  it("should throw BoardNameEmptyError for an empty value", () => {
    expect(() => BoardName.create("")).toThrowError(BoardNameEmptyError);
  });

  it("should throw BoardNameEmptyError for a whitespace-only value", () => {
    expect(() => BoardName.create("   ")).toThrowError(BoardNameEmptyError);
  });

  it("should trim surrounding whitespace", () => {
    const sut = BoardName.create("  Sprint 1  ");

    expect(sut.toString()).toBe("Sprint 1");
  });

  it("should restore a value without validating it", () => {
    const sut = BoardName.restore("");

    expect(sut.toString()).toBe("");
  });

  it("should consider two names with the same value as equal", () => {
    const a = BoardName.create("Sprint 1");
    const b = BoardName.create("Sprint 1");

    expect(a.equals(b)).toBe(true);
  });
});
