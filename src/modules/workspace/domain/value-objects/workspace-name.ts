import { ValueObject } from "@/core/entity/value-object";

import { InvalidWorkspaceNameError } from "../errors/invalid-workspace-name.error";

export const WORKSPACE_NAME_MIN = 3;
export const WORKSPACE_NAME_MAX = 80;

export class WorkspaceName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  public static fromRaw(value: string): WorkspaceName {
    const trimmed = value.trim();

    if (trimmed.length < WORKSPACE_NAME_MIN) {
      throw new InvalidWorkspaceNameError(`must be at least ${WORKSPACE_NAME_MIN} characters`);
    }

    if (trimmed.length > WORKSPACE_NAME_MAX) {
      throw new InvalidWorkspaceNameError(`must be at most ${WORKSPACE_NAME_MAX} characters`);
    }

    return new WorkspaceName(trimmed);
  }

  public toString(): string {
    return this.props.value;
  }
}
