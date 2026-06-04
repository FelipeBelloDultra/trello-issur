import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { CreateWorkspaceController } from "./controllers/create-workspace.controller";
import { GetWorkspaceController } from "./controllers/get-workspace.controller";
import { UpdateWorkspaceAvatarController } from "./controllers/update-workspace-avatar.controller";

export function setupHTTPWorkspaceContainer(): void {
  container.register<CreateWorkspaceController>(
    InjectionTokens.Controllers.CreateWorkspace,
    { useClass: CreateWorkspaceController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<GetWorkspaceController>(
    InjectionTokens.Controllers.GetWorkspace,
    { useClass: GetWorkspaceController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<UpdateWorkspaceAvatarController>(
    InjectionTokens.Controllers.UpdateWorkspaceAvatar,
    { useClass: UpdateWorkspaceAvatarController },
    { lifecycle: Lifecycle.Singleton },
  );
}
