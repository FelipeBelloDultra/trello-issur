import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { WorkspaceInvite } from "@/modules/workspace/domain/entities/workspace-invite";
import { InviteExpiry } from "@/modules/workspace/domain/value-objects/invite-expiry";
import {
  WorkspaceInviteStatus,
  WorkspaceInviteStatuses,
} from "@/modules/workspace/domain/value-objects/workspace-invite-status";
import {
  WorkspaceMemberRole,
  WorkspaceMemberRoles,
} from "@/modules/workspace/domain/value-objects/workspace-member-role";

interface MakeWorkspaceInviteOverrides {
  workspaceId?: UniqueEntityID;
  invitedByAccountId?: UniqueEntityID;
  email?: string;
  role?: WorkspaceMemberRole;
  token?: string;
  status?: WorkspaceInviteStatus;
  expiresAt?: InviteExpiry;
  createdAt?: Date;
  updatedAt?: Date;
}

export function makeWorkspaceInvite(
  overrides: MakeWorkspaceInviteOverrides = {},
  id?: UniqueEntityID,
): WorkspaceInvite {
  return WorkspaceInvite.create(
    {
      workspaceId: overrides.workspaceId ?? UniqueEntityID.create(),
      invitedByAccountId: overrides.invitedByAccountId ?? UniqueEntityID.create(),
      email: overrides.email ?? faker.internet.email().toLowerCase(),
      role: overrides.role ?? WorkspaceMemberRoles.Member,
      token: overrides.token ?? faker.string.hexadecimal({ length: 64, prefix: "" }),
      status: overrides.status ?? WorkspaceInviteStatuses.Pending,
      expiresAt: overrides.expiresAt ?? InviteExpiry.create(),
      createdAt: overrides.createdAt ?? new Date(),
      updatedAt: overrides.updatedAt ?? new Date(),
    },
    id,
  );
}
