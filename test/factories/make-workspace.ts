import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { Workspace } from "@/modules/workspace/domain/entities/workspace";
import { WorkspaceName } from "@/modules/workspace/domain/value-objects/workspace-name";
import { WorkspaceSlug } from "@/modules/workspace/domain/value-objects/workspace-slug";

interface MakeWorkspaceOverrides {
  name?: WorkspaceName;
  slug?: WorkspaceSlug;
  ownerId?: UniqueEntityID;
  description?: string | null;
  avatarUrl?: string | null;
  isPersonal?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export function makeWorkspace(
  overrides: MakeWorkspaceOverrides = {},
  id?: UniqueEntityID,
): Workspace {
  const rawName = faker.company.name();

  return Workspace.create(
    {
      name: overrides.name ?? WorkspaceName.fromRaw(rawName),
      slug: overrides.slug ?? WorkspaceSlug.fromName(rawName),
      ownerId: overrides.ownerId ?? UniqueEntityID.create(),
      description: overrides.description ?? null,
      avatarUrl: overrides.avatarUrl ?? null,
      isPersonal: overrides.isPersonal ?? false,
      createdAt: overrides.createdAt ?? new Date(),
      updatedAt: overrides.updatedAt ?? new Date(),
    },
    id,
  );
}
