import { MyWorkspaceView } from "@/modules/workspace/application/queries/list-my-workspaces/handler";

export class MyWorkspacePresenter {
  public static toHTTP({ workspace, role }: MyWorkspaceView) {
    return {
      id: workspace.id.toValue(),
      name: workspace.name.toString(),
      is_personal: workspace.isPersonal,
      role,
    };
  }
}
