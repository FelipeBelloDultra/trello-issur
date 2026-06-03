import { ValueObject } from "@/core/entity/value-object";

import { InvalidWorkspaceSlugError } from "../errors/invalid-workspace-slug.error";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIN = 3;
const MAX = 60;

export class WorkspaceSlug extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  public static fromRaw(value: string): WorkspaceSlug {
    const trimmed = value.trim().toLowerCase();

    if (trimmed.length < MIN) {
      throw new InvalidWorkspaceSlugError(`must be at least ${MIN} characters`);
    }

    if (trimmed.length > MAX) {
      throw new InvalidWorkspaceSlugError(`must be at most ${MAX} characters`);
    }

    if (!SLUG_PATTERN.test(trimmed)) {
      throw new InvalidWorkspaceSlugError(
        "only lowercase letters, numbers, and hyphens are allowed; cannot start or end with a hyphen",
      );
    }

    return new WorkspaceSlug(trimmed);
  }

  public static fromName(name: string): WorkspaceSlug {
    const slug = name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // strip combining diacritical marks
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");

    return WorkspaceSlug.fromRaw(slug);
  }

  public toString(): string {
    return this.props.value;
  }
}
