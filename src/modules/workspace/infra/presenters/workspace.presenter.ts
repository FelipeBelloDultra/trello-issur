import { Workspace } from "@/modules/workspace/domain/entities/workspace";

export class WorkspacePresenter {
  public static toHTTP(workspace: Workspace) {
    return {
      id: workspace.id.toValue(),
      name: workspace.name.toString(),
      slug: workspace.slug.toString(),
      description: workspace.description,
      avatar_url: workspace.avatarUrl,
      is_personal: workspace.isPersonal,
      owner_id: workspace.ownerId.toValue(),
      created_at: workspace.createdAt,
      updated_at: workspace.updatedAt,
    };
  }
}
