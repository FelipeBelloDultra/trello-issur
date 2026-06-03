import { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { workspaces } from "@/infra/db/schema/workspaces";
import { Workspace } from "@/modules/workspace/domain/entities/workspace";
import { WorkspaceName } from "@/modules/workspace/domain/value-objects/workspace-name";
import { WorkspaceSlug } from "@/modules/workspace/domain/value-objects/workspace-slug";

type WorkspaceRow = InferSelectModel<typeof workspaces>;
type WorkspaceInsert = InferInsertModel<typeof workspaces>;

export class WorkspaceMapper {
  public static toDomain(raw: WorkspaceRow): Workspace {
    return Workspace.create(
      {
        name: WorkspaceName.fromRaw(raw.name),
        slug: WorkspaceSlug.fromRaw(raw.slug),
        ownerId: UniqueEntityID.create(raw.ownerId),
        description: raw.description,
        avatarUrl: raw.avatarUrl,
        isPersonal: raw.isPersonal,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      UniqueEntityID.create(raw.id),
    );
  }

  public static toPersistence(workspace: Workspace): WorkspaceInsert {
    return {
      id: workspace.id.toValue(),
      name: workspace.name.toString(),
      slug: workspace.slug.toString(),
      ownerId: workspace.ownerId.toValue(),
      description: workspace.description,
      avatarUrl: workspace.avatarUrl,
      isPersonal: workspace.isPersonal,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }
}
