import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { WorkspaceMemberRepository } from "@/modules/workspace/application/repositories/workspace-member.repository";
import { WorkspaceRepository } from "@/modules/workspace/application/repositories/workspace.repository";

import { DrizzleWorkspaceMemberRepository } from "./repositories/drizzle-workspace-member.repository";
import { DrizzleWorkspaceRepository } from "./repositories/drizzle-workspace.repository";

export function setupDatabaseWorkspaceContainer(): void {
  container.register<WorkspaceRepository>(
    InjectionTokens.Repositories.Workspace,
    { useClass: DrizzleWorkspaceRepository },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<WorkspaceMemberRepository>(
    InjectionTokens.Repositories.WorkspaceMember,
    { useClass: DrizzleWorkspaceMemberRepository },
    { lifecycle: Lifecycle.Singleton },
  );
}
