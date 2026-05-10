const PERMISSION_REGISTRY = [
  // Workspace
  { key: "workspace:manage", description: "Manage workspace settings" },
  { key: "workspace:delete", description: "Delete the workspace" },
  { key: "workspace:invite", description: "Invite members to the workspace" },
  { key: "workspace:remove-member", description: "Remove members from the workspace" },
  // Board
  { key: "board:create", description: "Create new boards" },
  { key: "board:edit", description: "Edit board settings" },
  { key: "board:delete", description: "Delete boards" },
  // Card
  { key: "card:create", description: "Create cards" },
  { key: "card:edit", description: "Edit cards" },
  { key: "card:delete", description: "Delete cards" },
  { key: "card:move", description: "Move cards between columns" },
  { key: "card:assign", description: "Assign cards to members" },
] as const;

export type RawPermissionKey = (typeof PERMISSION_REGISTRY)[number]["key"];

export class PermissionKey {
  public static readonly registry = PERMISSION_REGISTRY;

  private constructor(private readonly value: RawPermissionKey) {}

  public static create(value: string): PermissionKey {
    const found = PERMISSION_REGISTRY.find((p) => p.key === value);
    if (!found) throw new Error(`Unknown permission key: "${value}"`);
    return new PermissionKey(value as RawPermissionKey);
  }

  public equals(other: PermissionKey): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
