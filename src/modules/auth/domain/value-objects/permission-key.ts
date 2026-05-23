import { ValueObject } from "@/core/entity/value-object";
import { InvalidPermissionKeyError } from "@/modules/auth/domain/errors/invalid-permission-key.error";

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

export const Permissions = {
  WorkspaceManage: "workspace:manage",
  WorkspaceDelete: "workspace:delete",
  WorkspaceInvite: "workspace:invite",
  WorkspaceRemoveMember: "workspace:remove-member",
  BoardCreate: "board:create",
  BoardEdit: "board:edit",
  BoardDelete: "board:delete",
  CardCreate: "card:create",
  CardEdit: "card:edit",
  CardDelete: "card:delete",
  CardMove: "card:move",
  CardAssign: "card:assign",
} as const satisfies Record<string, RawPermissionKey>;

export class PermissionKey extends ValueObject<{ value: RawPermissionKey }> {
  public static readonly registry = PERMISSION_REGISTRY;

  private constructor(value: RawPermissionKey) {
    super({ value });
  }

  public static create(value: string): PermissionKey {
    const found = PERMISSION_REGISTRY.find((p) => p.key === value);
    if (!found) throw new InvalidPermissionKeyError(value);

    return new PermissionKey(found.key);
  }

  public toString(): string {
    return this.props.value;
  }
}
