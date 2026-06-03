import { ValueObject } from "@/core/entity/value-object";

import { InvalidWorkspaceNameError } from "../errors/invalid-workspace-name.error";

const MIN = 3;
const MAX = 80;

export class WorkspaceName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  public static fromRaw(value: string): WorkspaceName {
    const trimmed = value.trim();

    if (trimmed.length < MIN) {
      throw new InvalidWorkspaceNameError(`must be at least ${MIN} characters`);
    }

    if (trimmed.length > MAX) {
      throw new InvalidWorkspaceNameError(`must be at most ${MAX} characters`);
    }

    return new WorkspaceName(trimmed);
  }

  public toString(): string {
    return this.props.value;
  }
}
