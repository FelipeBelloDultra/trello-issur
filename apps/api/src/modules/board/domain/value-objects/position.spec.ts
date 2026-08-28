import { PositionInvalidError } from "../errors/position-invalid.error";

import { Position } from "./position";

describe("Position", () => {
  describe("create", () => {
    it("should throw PositionInvalidError for NaN", () => {
      expect(() => Position.create(NaN)).toThrowError(PositionInvalidError);
    });

    it("should throw PositionInvalidError for Infinity", () => {
      expect(() => Position.create(Infinity)).toThrowError(PositionInvalidError);
    });

    it("should accept a finite number, including zero and negatives", () => {
      expect(Position.create(0).toNumber()).toBe(0);
      expect(Position.create(-5).toNumber()).toBe(-5);
      expect(Position.create(3.5).toNumber()).toBe(3.5);
    });
  });

  describe("first", () => {
    it("should return position 1", () => {
      expect(Position.first().toNumber()).toBe(1);
    });
  });

  describe("after", () => {
    it("should return 1 when there is no last position", () => {
      expect(Position.after(null).toNumber()).toBe(1);
    });

    it("should return last + 1 when a last position exists", () => {
      const last = Position.create(4);

      expect(Position.after(last).toNumber()).toBe(5);
    });
  });

  describe("between", () => {
    it("should return 1 when both neighbors are absent (empty list)", () => {
      expect(Position.between(null, null).toNumber()).toBe(1);
    });

    it("should return the midpoint when inserting between two siblings", () => {
      const before = Position.create(1);
      const after = Position.create(2);

      expect(Position.between(before, after).toNumber()).toBe(1.5);
    });

    it("should return half of the next position when inserting at the start", () => {
      const after = Position.create(2);

      expect(Position.between(null, after).toNumber()).toBe(1);
    });

    it("should return before + 1 when inserting at the end", () => {
      const before = Position.create(4);

      expect(Position.between(before, null).toNumber()).toBe(5);
    });

    it("should never renumber existing siblings — repeated inserts at the same spot keep converging", () => {
      const before = Position.create(1);
      const after = Position.create(2);

      const firstInsert = Position.between(before, after);
      expect(firstInsert.toNumber()).toBe(1.5);

      const secondInsert = Position.between(before, firstInsert);
      expect(secondInsert.toNumber()).toBe(1.25);
    });
  });

  describe("restore", () => {
    it("should skip validation, unlike create", () => {
      const sut = Position.restore(NaN);

      expect(Number.isNaN(sut.toNumber())).toBe(true);
    });
  });

  describe("equals", () => {
    it("should consider two positions with the same value as equal", () => {
      expect(Position.create(2.5).equals(Position.create(2.5))).toBe(true);
    });

    it("should consider two positions with different values as not equal", () => {
      expect(Position.create(2.5).equals(Position.create(3))).toBe(false);
    });
  });
});
