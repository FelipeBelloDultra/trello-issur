import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { CreateWorkspaceController } from "./controllers/create-workspace.controller";
import { GetWorkspaceController } from "./controllers/get-workspace.controller";

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
}
