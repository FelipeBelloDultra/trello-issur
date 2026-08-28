import { ValueObject } from "@/core/entity/value-object";

import { PositionInvalidError } from "../errors/position-invalid.error";

// Fractional position: inserting between two siblings takes the midpoint of
// their positions instead of renumbering every sibling after a reorder (see
// specs/001-board-card-module/research.md §2). Deliberately no automatic
// rebalancing here — repeated inserts at the same spot could eventually
// exhaust double precision, but that's a documented, deferred edge case,
// not a v1 concern (see research.md's "Known limitation" note).
export class Position extends ValueObject<{ value: number }> {
  private constructor(value: number) {
    super({ value });
  }

  public static create(value: number): Position {
    if (!Number.isFinite(value)) {
      throw new PositionInvalidError();
    }

    return new Position(value);
  }

  public static restore(value: number): Position {
    return new Position(value);
  }

  public static first(): Position {
    return new Position(1);
  }

  public static after(last: Position | null): Position {
    return last ? new Position(last.toNumber() + 1) : Position.first();
  }

  public static between(before: Position | null, after: Position | null): Position {
    if (!before && !after) return Position.first();
    if (!before) return new Position(after!.toNumber() / 2);
    if (!after) return new Position(before.toNumber() + 1);

    return new Position((before.toNumber() + after.toNumber()) / 2);
  }

  public toNumber(): number {
    return this.props.value;
  }
}
